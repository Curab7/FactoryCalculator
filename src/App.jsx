import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, Database, Github } from 'lucide-react';
import CalculatorView from './components/CalculatorView';
import DatabaseView from './components/DatabaseView';
import TabButton from './components/TabButton';
import { DEFAULT_GROUP_NAME, INITIAL_RECIPES } from './data/recipes';

const STORAGE_KEY = 'factory_calc_data';

export default function App() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [recipeGroups, setRecipeGroups] = useState({
    [DEFAULT_GROUP_NAME]: INITIAL_RECIPES
  });
  const [currentGroupName, setCurrentGroupName] = useState(DEFAULT_GROUP_NAME);
  const [targetItem, setTargetItem] = useState('电路板');
  const [targetRate, setTargetRate] = useState(60);
  const [preferredRecipes, setPreferredRecipes] = useState({});

  const recipes = useMemo(() => recipeGroups[currentGroupName] || [], [recipeGroups, currentGroupName]);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;
    try {
      const parsed = JSON.parse(savedData);
      if (parsed.groups && parsed.current) {
        setRecipeGroups(parsed.groups);
        setCurrentGroupName(parsed.current);
        if (parsed.preferred) setPreferredRecipes(parsed.preferred);
        if (parsed.target) setTargetItem(parsed.target);
      }
    } catch (e) {
      console.error('Failed to load saved data', e);
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      groups: recipeGroups,
      current: currentGroupName,
      preferred: preferredRecipes,
      target: targetItem
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [recipeGroups, currentGroupName, preferredRecipes, targetItem]);

  const addRecipe = (recipe) => {
    setRecipeGroups((prev) => ({
      ...prev,
      [currentGroupName]: [...prev[currentGroupName], recipe]
    }));
  };

  const deleteRecipe = (id) => {
    setRecipeGroups((prev) => ({
      ...prev,
      [currentGroupName]: prev[currentGroupName].filter((r) => r.id !== id)
    }));
  };

  const updateGroups = (newGroups, newCurrentName) => {
    setRecipeGroups(newGroups);
    if (newCurrentName) setCurrentGroupName(newCurrentName);
  };

  const allItems = useMemo(() => {
    const items = new Set();
    recipes.forEach((r) => {
      r.inputs.forEach((i) => items.add(i.item));
      r.outputs.forEach((o) => items.add(o.item));
    });
    return Array.from(items).sort();
  }, [recipes]);

  const getRecipesForItem = (itemName) => recipes.filter((r) => r.outputs.some((o) => o.item === itemName));

  const calculateTree = (itemName, ratePerMin, depth = 0) => {
    if (depth > 15) return { item: itemName, rate: ratePerMin, error: '循环深度限制' };

    const availableRecipes = getRecipesForItem(itemName);
    if (availableRecipes.length === 0) return { type: 'raw', item: itemName, rate: ratePerMin };

    const selectedRecipeId = preferredRecipes[itemName] || availableRecipes[0].id;
    const activeRecipe = recipes.find((r) => r.id === selectedRecipeId) || availableRecipes[0];

    const outputInfo = activeRecipe.outputs.find((o) => o.item === itemName);
    const outputAmount = outputInfo ? outputInfo.amount : 1;

    const itemsPerMachinePerMin = (60 / activeRecipe.time) * outputAmount;
    const machinesNeeded = ratePerMin / itemsPerMachinePerMin;
    const actualCraftsPerMin = machinesNeeded * (60 / activeRecipe.time);

    const children = activeRecipe.inputs.map((input) => {
      const requiredRate = input.amount * actualCraftsPerMin;
      return calculateTree(input.item, requiredRate, depth + 1);
    });

    const byproducts = activeRecipe.outputs
      .filter((o) => o.item !== itemName)
      .map((o) => ({
        item: o.item,
        rate: o.amount * actualCraftsPerMin
      }));

    return {
      type: 'product',
      item: itemName,
      rate: ratePerMin,
      recipe: activeRecipe,
      availableRecipes,
      machines: machinesNeeded,
      children,
      byproducts
    };
  };

  const productionTree = useMemo(() => {
    if (!targetItem) return null;
    return calculateTree(targetItem, parseFloat(targetRate) || 0);
  }, [targetItem, targetRate, recipes, preferredRecipes]);

  const materialBalance = useMemo(() => {
    if (!productionTree) return null;
    const balance = {};

    const traverse = (node) => {
      if (node.type === 'raw') {
        balance[node.item] = (balance[node.item] || 0) - node.rate;
      } else if (node.type === 'product') {
        if (node.byproducts) {
          node.byproducts.forEach((bp) => {
            balance[bp.item] = (balance[bp.item] || 0) + bp.rate;
          });
        }
        node.children.forEach(traverse);
      }
    };

    balance[productionTree.item] = (balance[productionTree.item] || 0) + productionTree.rate;
    traverse(productionTree);

    return Object.entries(balance)
      .sort((a, b) => b[1] - a[1])
      .map(([item, rate]) => ({ item, rate }));
  }, [productionTree]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-slate-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <span className="w-5 h-5 animate-spin-slow block border-2 border-white/60 border-t-white rounded-full"></span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">AutoFact</h1>
              <span className="text-xs text-slate-400">工厂量化助手</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <nav className="flex space-x-1 bg-slate-900/50 p-1 rounded-lg">
              <TabButton
                active={activeTab === 'calculator'}
                onClick={() => setActiveTab('calculator')}
                icon={<Calculator size={16} />}
                label="量化计算"
              />
              <TabButton
                active={activeTab === 'database'}
                onClick={() => setActiveTab('database')}
                icon={<Database size={16} />}
                label="配方管理"
              />
            </nav>
            <a
              href="https://github.com/Curab7/FactoryCalculator"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="查看 GitHub 仓库"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 min-h-[calc(100vh-8rem)]">
        {activeTab === 'calculator' ? (
          <CalculatorView
            allItems={allItems}
            targetItem={targetItem}
            setTargetItem={setTargetItem}
            targetRate={targetRate}
            setTargetRate={setTargetRate}
            treeData={productionTree}
            preferredRecipes={preferredRecipes}
            setPreferredRecipes={setPreferredRecipes}
            materialBalance={materialBalance}
          />
        ) : (
          <DatabaseView
            recipes={recipes}
            addRecipe={addRecipe}
            deleteRecipe={deleteRecipe}
            recipeGroups={recipeGroups}
            currentGroupName={currentGroupName}
            updateGroups={updateGroups}
          />
        )}
      </main>

      <footer className="bg-slate-100 border-t border-slate-200 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-600">
            <a
              href="https://github.com/Curab7/FactoryCalculator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              GitHub 仓库
            </a>
            {' · '}
            <span className="text-slate-500">纯AI制作</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

