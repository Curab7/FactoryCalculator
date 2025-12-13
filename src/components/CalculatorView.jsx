import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calculator as CalculatorIcon, ChevronDown, Database, Save, Search, Settings } from 'lucide-react';
import TreeNode from './TreeNode';

export default function CalculatorView({
  allItems,
  targetItem,
  setTargetItem,
  targetRate,
  setTargetRate,
  treeData,
  preferredRecipes,
  setPreferredRecipes,
  materialBalance
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = useMemo(
    () => allItems.filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase())),
    [allItems, searchTerm]
  );

  const handleSelect = (item) => {
    setTargetItem(item);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-5 items-end md:items-center justify-between">
        <div className="flex flex-wrap gap-5 items-end w-full md:w-auto">
          <div className="space-y-1 relative w-full md:w-64" ref={wrapperRef}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">目标产物</label>
            <div className="relative">
              <div
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white flex items-center justify-between cursor-pointer hover:border-blue-400 transition"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={targetItem ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                  {targetItem || '选择产物...'}
                </span>
                <ChevronDown size={16} className="text-slate-400" />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                  <div className="p-2 sticky top-0 bg-white border-b border-slate-100">
                    <div className="relative">
                      <Search size={14} className="absolute left-2 top-2.5 text-slate-400" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="搜索..."
                        className="w-full pl-8 pr-2 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <div
                        key={item}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                          item === targetItem ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700'
                        }`}
                        onClick={() => handleSelect(item)}
                      >
                        {item}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-400 text-center">无结果</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1 w-full md:w-32">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">目标速率 (/min)</label>
            <input
              type="number"
              value={targetRate}
              onChange={(e) => setTargetRate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>
        </div>

        <div className="text-right hidden md:block">
          <div className="text-xs text-slate-400">数据状态</div>
          <div className="text-sm font-medium text-green-600 flex items-center justify-end gap-1">
            <Save size={14} /> 已本地保存
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto min-h-[500px]">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-600" />
            生产流程树
          </h2>
          <div className="pb-12 min-w-max">
            {treeData ? (
              <TreeNode
                node={treeData}
                preferredRecipes={preferredRecipes}
                setPreferredRecipes={setPreferredRecipes}
                isRoot
              />
            ) : (
              <div className="text-slate-400 text-center py-20 flex flex-col items-center">
                <CalculatorIcon size={48} className="mb-4 text-slate-200" />
                请在上方的下拉框中选择一个目标产物
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-green-600" />
            物料平衡表
          </h2>

          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
            {materialBalance && materialBalance.length > 0 ? (
              materialBalance.map(({ item, rate }) => (
                <div
                  key={item}
                  className={`flex justify-between items-center p-3 rounded-lg border ${
                    rate >= 0 ? 'bg-green-50/50 border-green-100' : 'bg-amber-50/50 border-amber-100'
                  }`}
                >
                  <span className="font-medium text-slate-700 text-sm">{item}</span>
                  <span
                    className={`font-mono font-bold text-sm ${rate >= 0 ? 'text-green-600' : 'text-amber-600'}`}
                  >
                    {rate > 0 ? '+' : ''}
                    {parseFloat(rate.toFixed(2))}/m
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-10 text-sm">暂无数据</div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">提示</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              如果在树状图中看到下拉箭头，说明该物品有多个可用配方，您可以点击切换。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

