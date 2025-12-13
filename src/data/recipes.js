export const DEFAULT_GROUP_NAME = '默认配方组';

export const INITIAL_RECIPES = [
  {
    id: 'r_iron_ingot',
    outputs: [{ item: '铁块', amount: 1 }],
    inputs: [{ item: '铁矿', amount: 1 }],
    machine: '熔炉',
    time: 2
  },
  {
    id: 'r_gear',
    outputs: [{ item: '齿轮', amount: 1 }],
    inputs: [{ item: '铁块', amount: 2 }],
    machine: '制造台',
    time: 4
  },
  {
    id: 'r_circuit_basic',
    outputs: [{ item: '电路板', amount: 1 }],
    inputs: [
      { item: '铁块', amount: 1 },
      { item: '铜线', amount: 3 }
    ],
    machine: '制造台',
    time: 6
  },
  {
    id: 'r_copper_wire',
    outputs: [{ item: '铜线', amount: 2 }],
    inputs: [{ item: '铜块', amount: 1 }],
    machine: '制造台',
    time: 1
  },
  {
    id: 'r_copper_ingot',
    outputs: [{ item: '铜块', amount: 1 }],
    inputs: [{ item: '铜矿', amount: 1 }],
    machine: '熔炉',
    time: 2
  },
  {
    id: 'r_iron_ingot_adv',
    outputs: [{ item: '铁块', amount: 2 }],
    inputs: [
      { item: '铁矿', amount: 1 },
      { item: '纯净水', amount: 1 }
    ],
    machine: '洗矿机',
    time: 2
  }
];

