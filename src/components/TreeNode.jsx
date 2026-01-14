import { ChevronDown } from 'lucide-react';
import React from 'react';

export default function TreeNode({
  node,
  preferredRecipes,
  setPreferredRecipes,
  isRoot = false
}) {
  const isRaw = node.type === 'raw';
  const hasAlternatives = node.availableRecipes && node.availableRecipes.length > 1;

  const handleRecipeSwitch = (recipeId) => {
    setPreferredRecipes((prev) => ({
      ...prev,
      [node.item]: recipeId
    }));
  };

  return (
    <div className="flex flex-col items-center relative">
      <div
        className={`
        relative z-10 flex flex-col items-center p-3 rounded-xl border transition-all min-w-[160px]
        ${isRoot ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500 shadow-md ring-2 ring-blue-100 dark:ring-blue-900/50' : 'bg-white dark:bg-slate-800'}
        ${isRaw ? 'border-slate-300 dark:border-slate-600 border-dashed bg-slate-50 dark:bg-slate-800/50' : 'border-slate-200 dark:border-slate-700 shadow-sm'}
      `}
      >
        <div
          className={`
          text-[10px] px-2 py-0.5 rounded-full -mt-6 mb-2 font-mono font-bold
          ${isRoot ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-slate-700 dark:bg-slate-600 text-white'}
        `}
        >
          {parseFloat(node.rate.toFixed(2))} / min
        </div>

        <div className="font-bold text-slate-800 dark:text-slate-200 mb-1 text-center">{node.item}</div>

        {!isRaw && (
          <div className="text-center w-full">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-700 py-1 px-2 rounded mx-auto w-fit">
              <span>{node.recipe.machine}</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">x{parseFloat(node.machines.toFixed(2))}</span>
            </div>

            {hasAlternatives && (
              <div className="mt-1 w-full px-1">
                <div className="relative">
                  <select
                    className="w-full text-[10px] appearance-none bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 rounded px-2 py-1 outline-none cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/50 pr-6"
                    value={node.recipe.id}
                    onChange={(e) => handleRecipeSwitch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    title="点击切换配方"
                  >
                    {node.availableRecipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        ⟳ 使用: {r.inputs.map((i) => i.item).join('+')}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={10}
                    className="absolute right-2 top-1.5 text-yellow-600 dark:text-yellow-400 pointer-events-none"
                  />
                </div>
              </div>
            )}

            {node.byproducts && node.byproducts.length > 0 && (
              <div className="mt-2 text-[10px] text-green-700 dark:text-green-400 flex flex-col items-center bg-green-50 dark:bg-green-900/20 w-full rounded p-1 border border-green-100 dark:border-green-800">
                {node.byproducts.map((bp, idx) => (
                  <span key={idx}>+ {bp.item} {parseFloat(bp.rate.toFixed(1))}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {isRaw && (
          <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider border border-slate-200 dark:border-slate-600 px-2 rounded-full">
            RAW
          </div>
        )}
      </div>

      {!isRaw && node.children && node.children.length > 0 && (
        <>
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
          <div className="flex items-start justify-center gap-4 relative">
            {node.children.map((child, index) => (
              <div key={`${child.item}-${index}`} className="flex flex-col items-center pt-4 relative">
                <div
                  className="absolute top-0 w-full h-px bg-slate-300 dark:bg-slate-600 transform -translate-y-4 hidden md:block"
                  style={{
                    left: index === 0 ? '50%' : 'auto',
                    right: index === node.children.length - 1 ? '50%' : 'auto',
                    width: node.children.length === 1 ? '0' : '50%'
                  }}
                />
                {index > 0 && <div className="absolute top-[-1rem] left-0 w-1/2 h-px bg-slate-300 dark:bg-slate-600"></div>}
                {index < node.children.length - 1 && (
                  <div className="absolute top-[-1rem] right-0 w-1/2 h-px bg-slate-300 dark:bg-slate-600"></div>
                )}
                <div className="absolute top-[-1rem] h-4 w-px bg-slate-300 dark:bg-slate-600"></div>

                <TreeNode
                  node={child}
                  preferredRecipes={preferredRecipes}
                  setPreferredRecipes={setPreferredRecipes}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

