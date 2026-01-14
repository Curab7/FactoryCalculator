import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Database,
  Download,
  Folder,
  FolderPlus,
  Plus,
  Search,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { generateId } from '../utils/id';

export default function DatabaseView({
  recipes,
  addRecipe,
  deleteRecipe,
  recipeGroups,
  currentGroupName,
  updateGroups
}) {
  const [newRecipe, setNewRecipe] = useState({
    outputs: [{ item: '', amount: 1 }],
    inputs: [{ item: '', amount: 1 }],
    machine: '制造台',
    time: 5
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newGroupInput, setNewGroupInput] = useState('');

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showConfirm = (title, message, onConfirm) => {
    setModalConfig({ isOpen: true, type: 'confirm', title, message, onConfirm });
  };

  const showAlert = (title, message) => {
    setModalConfig({
      isOpen: true,
      type: 'alert',
      title,
      message,
      onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false }))
    });
  };

  const closeModals = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const filteredRecipes = recipes.filter((r) => {
    const term = searchQuery.toLowerCase();
    return (
      r.outputs.some((o) => o.item.toLowerCase().includes(term)) ||
      r.inputs.some((i) => i.item.toLowerCase().includes(term)) ||
      r.machine.toLowerCase().includes(term)
    );
  });

  const handleCreateGroup = () => {
    if (!newGroupInput.trim()) return;
    if (recipeGroups[newGroupInput]) {
      showAlert('创建失败', '该配方组名称已存在，请换一个。');
      return;
    }
    updateGroups({ ...recipeGroups, [newGroupInput]: [] }, newGroupInput);
    setNewGroupInput('');
    setIsGroupModalOpen(false);
  };

  const handleDeleteGroup = () => {
    const groupNames = Object.keys(recipeGroups);
    if (groupNames.length <= 1) {
      showAlert('无法删除', '必须保留至少一个配方组。');
      return;
    }

    showConfirm(
      '删除配方组',
      `确定要删除配方组 "${currentGroupName}" 及其所有配方吗？此操作无法撤销。`,
      () => {
        const newGroups = { ...recipeGroups };
        delete newGroups[currentGroupName];
        const nextGroup = Object.keys(newGroups)[0];
        updateGroups(newGroups, nextGroup);
        closeModals();
      }
    );
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(recipeGroups[currentGroupName], null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentGroupName}_recipes.json`;
    link.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          showConfirm('导入配方', `导入将完全覆盖当前组 "${currentGroupName}" 的所有配方，确定要继续吗？`, () => {
            updateGroups({ ...recipeGroups, [currentGroupName]: imported });
            closeModals();
          });
        } else {
          showAlert('导入失败', '文件格式不正确，请确保是有效的配方数组 JSON 文件。');
        }
      } catch (err) {
        showAlert('导入失败', 'JSON 解析失败，文件可能已损坏。');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleClearAll = () => {
    showConfirm('清空配方', `确定要清空当前组 "${currentGroupName}" 的所有配方吗？此操作无法撤销。`, () => {
      updateGroups({ ...recipeGroups, [currentGroupName]: [] });
      closeModals();
    });
  };

  const updateInput = (idx, field, value) => {
    const newInputs = [...newRecipe.inputs];
    newInputs[idx][field] = value;
    setNewRecipe({ ...newRecipe, inputs: newInputs });
  };

  const updateOutput = (idx, field, value) => {
    const newOutputs = [...newRecipe.outputs];
    newOutputs[idx][field] = value;
    setNewRecipe({ ...newRecipe, outputs: newOutputs });
  };

  const removeInput = (idx) => {
    const nextInputs = newRecipe.inputs.filter((_, i) => i !== idx);
    setNewRecipe({ ...newRecipe, inputs: nextInputs });
  };

  const removeOutput = (idx) => {
    const nextOutputs = newRecipe.outputs.filter((_, i) => i !== idx);
    setNewRecipe({ ...newRecipe, outputs: nextOutputs });
  };

  const handleSaveRecipe = () => {
    if (!newRecipe.outputs[0].item || !newRecipe.inputs[0].item) return;
    const recipeToAdd = {
      ...newRecipe,
      id: `custom_${generateId()}`,
      time: parseFloat(newRecipe.time),
      inputs: newRecipe.inputs.map((i) => ({ ...i, amount: parseFloat(i.amount) })),
      outputs: newRecipe.outputs.map((o) => ({ ...o, amount: parseFloat(o.amount) }))
    };
    addRecipe(recipeToAdd);
    setNewRecipe({
      outputs: [{ item: '', amount: 1 }],
      inputs: [{ item: '', amount: 1 }],
      machine: '制造台',
      time: 5
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Folder size={20} />
          </div>
          <div className="relative">
            <label className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">当前配方组</label>
            <select
              value={currentGroupName}
              onChange={(e) => updateGroups(recipeGroups, e.target.value)}
              className="bg-transparent dark:bg-transparent font-bold text-slate-800 dark:text-slate-200 text-lg outline-none cursor-pointer pr-6 appearance-none hover:text-blue-600 dark:hover:text-blue-400"
            >
              {Object.keys(recipeGroups).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <span className="absolute right-0 bottom-1.5 pointer-events-none text-slate-400 dark:text-slate-500">⌄</span>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition whitespace-nowrap"
          >
            <FolderPlus size={16} /> 新建组
          </button>

          <div className="h-9 w-px bg-slate-200 dark:bg-slate-600 mx-1"></div>

          <label className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition cursor-pointer whitespace-nowrap">
            <Upload size={16} /> 导入
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition whitespace-nowrap"
          >
            <Download size={16} /> 导出
          </button>

          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition whitespace-nowrap"
          >
            <Trash2 size={16} /> 清空
          </button>

          <div className="h-9 w-px bg-slate-200 dark:bg-slate-600 mx-1"></div>

          <button
            onClick={handleDeleteGroup}
            title="删除当前组"
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">新建配方组</h3>
            <input
              autoFocus
              placeholder="例如: 戴森球计划"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              value={newGroupInput}
              onChange={(e) => setNewGroupInput(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsGroupModalOpen(false)} className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                取消
              </button>
              <button onClick={handleCreateGroup} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600">
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`p-3 rounded-full ${
                  modalConfig.type === 'alert' 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{modalConfig.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 leading-relaxed">{modalConfig.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {modalConfig.type === 'confirm' && (
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition"
                >
                  取消
                </button>
              )}
              <button
                onClick={() => {
                  if (modalConfig.onConfirm) modalConfig.onConfirm();
                  if (modalConfig.type === 'alert') closeModals();
                }}
                className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition shadow-sm ${
                  modalConfig.type === 'alert' 
                    ? 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600' 
                    : 'bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600'
                }`}
              >
                {modalConfig.type === 'alert' ? '知道了' : '确定执行'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            录入新配方
          </h2>

          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-600">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">输入原料</label>
                <button
                  onClick={() => setNewRecipe({ ...newRecipe, inputs: [...newRecipe.inputs, { item: '', amount: 1 }] })}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  + 添加
                </button>
              </div>
              {newRecipe.inputs.map((input, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    placeholder="名称"
                    className="flex-1 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:border-blue-500 dark:focus:border-blue-400 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    value={input.item}
                    onChange={(e) => updateInput(idx, 'item', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="#"
                    className="w-16 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:border-blue-500 dark:focus:border-blue-400 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    value={input.amount}
                    onChange={(e) => updateInput(idx, 'amount', e.target.value)}
                  />
                  {newRecipe.inputs.length > 1 && (
                    <button onClick={() => removeInput(idx)} className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <ArrowRight className="text-slate-300 dark:text-slate-600" size={20} />
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-600">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">输出产品</label>
                <button
                  onClick={() => setNewRecipe({ ...newRecipe, outputs: [...newRecipe.outputs, { item: '', amount: 1 }] })}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  + 添加
                </button>
              </div>
              {newRecipe.outputs.map((output, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    placeholder="名称"
                    className="flex-1 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:border-blue-500 dark:focus:border-blue-400 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    value={output.item}
                    onChange={(e) => updateOutput(idx, 'item', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="#"
                    className="w-16 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:border-blue-500 dark:focus:border-blue-400 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    value={output.amount}
                    onChange={(e) => updateOutput(idx, 'amount', e.target.value)}
                  />
                  {newRecipe.outputs.length > 1 && (
                    <button onClick={() => removeOutput(idx)} className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">生产设施</label>
                <input
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  value={newRecipe.machine}
                  onChange={(e) => setNewRecipe({ ...newRecipe, machine: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">耗时 (秒)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  value={newRecipe.time}
                  onChange={(e) => setNewRecipe({ ...newRecipe, time: e.target.value })}
                />
              </div>
            </div>

            <button
              onClick={handleSaveRecipe}
              className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-md font-bold text-sm"
            >
              保存配方
            </button>
          </div>
        </div>

        <div className="xl:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center">
              <Database className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-400" />
              配方库 ({filteredRecipes.length})
            </h2>
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
              <input
                placeholder="搜索配方..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition flex justify-between items-center group"
                >
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        {recipe.inputs.map((i, idx) => (
                          <span key={idx} className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                            {i.item} <span className="text-xs opacity-70">x{i.amount}</span>
                          </span>
                        ))}
                      </div>
                      <ArrowRight size={14} className="text-slate-300 dark:text-slate-600" />
                      <div className="flex items-center gap-1">
                        {recipe.outputs.map((o, idx) => (
                          <span
                            key={idx}
                            className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800 px-2 py-1 rounded font-medium"
                          >
                            {o.item} <span className="text-xs opacity-70">x{o.amount}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 flex gap-4">
                      <span className="flex items-center gap-1">⚙ {recipe.machine}</span>
                      <span className="flex items-center gap-1">⏱ {recipe.time}s</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRecipe(recipe.id)}
                    className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                没有找到匹配的配方
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

