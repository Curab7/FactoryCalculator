import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calculator as CalculatorIcon, ChevronDown, ChevronsDownUp, ChevronsUpDown, Database, Maximize2, Minus, Plus, Save, Search, Settings } from 'lucide-react';
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

  // 缩放与拖动状态
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const treeContainerRef = useRef(null);
  const treeContentRef = useRef(null);

  // 节点展开/折叠状态（key 为节点路径，value 为是否展开）
  const [expandedNodes, setExpandedNodes] = useState({});

  const MIN_SCALE = 0.25;
  const MAX_SCALE = 2;
  const SCALE_STEP = 0.1;

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

  // 缩放处理函数
  const handleZoom = useCallback((delta, centerX, centerY) => {
    setScale((prevScale) => {
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prevScale + delta));
      
      // 如果提供了中心点，则围绕该点缩放
      if (centerX !== undefined && centerY !== undefined && treeContainerRef.current) {
        const rect = treeContainerRef.current.getBoundingClientRect();
        const x = centerX - rect.left;
        const y = centerY - rect.top;
        
        const scaleRatio = newScale / prevScale;
        setPosition((prev) => ({
          x: x - (x - prev.x) * scaleRatio,
          y: y - (y - prev.y) * scaleRatio
        }));
      }
      
      return newScale;
    });
  }, []);

  const zoomIn = useCallback(() => handleZoom(SCALE_STEP), [handleZoom]);
  const zoomOut = useCallback(() => handleZoom(-SCALE_STEP), [handleZoom]);
  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 鼠标滚轮缩放（无需按 Ctrl）
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
    handleZoom(delta, e.clientX, e.clientY);
  }, [handleZoom]);

  // 使用 passive: false 的事件监听器来确保可以阻止默认滚动行为
  useEffect(() => {
    const container = treeContainerRef.current;
    if (!container) return;

    const wheelHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
      handleZoom(delta, e.clientX, e.clientY);
    };

    container.addEventListener('wheel', wheelHandler, { passive: false });
    return () => container.removeEventListener('wheel', wheelHandler);
  }, [handleZoom]);

  // 切换节点展开/折叠状态
  const toggleNodeExpanded = useCallback((nodePath) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodePath]: prev[nodePath] === undefined ? false : !prev[nodePath]
    }));
  }, []);

  // 判断节点是否展开（默认展开）
  const isNodeExpanded = useCallback((nodePath) => {
    return expandedNodes[nodePath] !== false;
  }, [expandedNodes]);

  // 全部展开
  const expandAll = useCallback(() => {
    setExpandedNodes({});
  }, []);

  // 拖动开始
  const handleMouseDown = useCallback((e) => {
    // 排除点击到控件元素的情况
    if (e.target.closest('select, button, input')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  // 拖动中
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  // 拖动结束
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 添加全局鼠标事件监听（用于处理拖动到容器外的情况）
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 目标产物变化时重置视图和展开状态
  useEffect(() => {
    resetView();
    setExpandedNodes({});
  }, [targetItem, resetView]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-5 items-end md:items-center justify-between">
        <div className="flex flex-wrap gap-5 items-end w-full md:w-auto">
          <div className="space-y-1 relative w-full md:w-64" ref={wrapperRef}>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">目标产物</label>
            <div className="relative">
              <div
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-between cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={targetItem ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-400 dark:text-slate-500'}>
                  {targetItem || '选择产物...'}
                </span>
                <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                  <div className="p-2 sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                    <div className="relative">
                      <Search size={14} className="absolute left-2 top-2.5 text-slate-400 dark:text-slate-500" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="搜索..."
                        className="w-full pl-8 pr-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-slate-900 dark:text-slate-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <div
                        key={item}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
                          item === targetItem ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'
                        }`}
                        onClick={() => handleSelect(item)}
                      >
                        {item}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500 text-center">无结果</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1 w-full md:w-32">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">目标速率 (/min)</label>
            <input
              type="number"
              value={targetRate}
              onChange={(e) => setTargetRate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none font-mono bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="text-right hidden md:block">
          <div className="text-xs text-slate-400 dark:text-slate-500">数据状态</div>
          <div className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center justify-end gap-1">
            <Save size={14} /> 已本地保存
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              生产流程树
            </h2>
            
            {/* 缩放控件 */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={zoomOut}
                disabled={scale <= MIN_SCALE}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="缩小"
              >
                <Minus size={16} className="text-slate-600 dark:text-slate-300" />
              </button>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 w-12 text-center select-none">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={scale >= MAX_SCALE}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="放大"
              >
                <Plus size={16} className="text-slate-600 dark:text-slate-300" />
              </button>
              <div className="w-px h-5 bg-slate-300 dark:bg-slate-500 mx-1"></div>
              <button
                onClick={resetView}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                title="重置视图"
              >
                <Maximize2 size={16} className="text-slate-600 dark:text-slate-300" />
              </button>
              <div className="w-px h-5 bg-slate-300 dark:bg-slate-500 mx-1"></div>
              <button
                onClick={expandAll}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                title="全部展开"
              >
                <ChevronsUpDown size={16} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>

          {/* 可缩放拖动的树容器 */}
          <div
            ref={treeContainerRef}
            className="flex-1 overflow-hidden relative rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
          >
            {/* 网格背景 */}
            <div 
              className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                backgroundSize: `${20 * scale}px ${20 * scale}px`,
                backgroundPosition: `${position.x % (20 * scale)}px ${position.y % (20 * scale)}px`
              }}
            />
            
            <div
              ref={treeContentRef}
              className="p-8 min-w-max"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: '0 0',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
            >
              {treeData ? (
                <TreeNode
                  node={treeData}
                  preferredRecipes={preferredRecipes}
                  setPreferredRecipes={setPreferredRecipes}
                  isNodeExpanded={isNodeExpanded}
                  toggleNodeExpanded={toggleNodeExpanded}
                  nodePath="root"
                  isRoot
                />
              ) : (
                <div className="text-slate-400 dark:text-slate-500 text-center py-20 flex flex-col items-center">
                  <CalculatorIcon size={48} className="mb-4 text-slate-200 dark:text-slate-700" />
                  请在上方的下拉框中选择一个目标产物
                </div>
              )}
            </div>

            {/* 操作提示 */}
            {treeData && (
              <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 dark:text-slate-500 bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded backdrop-blur-sm">
                拖动平移 · 滚轮缩放 · 点击节点折叠/展开
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            物料平衡表
          </h2>

          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
            {materialBalance && materialBalance.length > 0 ? (
              materialBalance.map(({ item, rate }) => (
                <div
                  key={item}
                  className={`flex justify-between items-center p-3 rounded-lg border ${
                    rate >= 0 
                      ? 'bg-green-50/50 dark:bg-green-900/20 border-green-100 dark:border-green-800' 
                      : 'bg-amber-50/50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'
                  }`}
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{item}</span>
                  <span
                    className={`font-mono font-bold text-sm ${rate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}
                  >
                    {rate > 0 ? '+' : ''}
                    {parseFloat(rate.toFixed(2))}/m
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 dark:text-slate-500 py-10 text-sm">暂无数据</div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">提示</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              如果在树状图中看到下拉箭头，说明该物品有多个可用配方，您可以点击切换。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

