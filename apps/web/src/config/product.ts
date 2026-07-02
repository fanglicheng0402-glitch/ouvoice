export const PRODUCT_IDENTITY = {
  name: '声脉',
  englishName: 'VoxLink',
  legacyName: '瓯语声（OuVoice）',
  locale: 'zh-CN',
  region: '浙江温州',
  promise: '让每一段温州话的去向、授权和收益都由贡献者掌握。',
} as const

export const PRODUCT_TABS = [
  {
    id: 'record',
    label: '录音',
    sections: ['开始录音', '本地说法上传'],
    details: ['家庭', '市场', '节日', '自由录音'],
  },
  {
    id: 'vault',
    label: '声库',
    sections: ['我的录音', 'AI 反馈'],
    details: ['已通过', '未通过'],
  },
  {
    id: 'community',
    label: '社区',
    sections: ['温州方言共振地图', '有偿任务', '社区档案'],
    details: ['鹿城', '瓯海', '龙湾', '瑞安', '乐清', '永嘉'],
  },
  {
    id: 'assets',
    label: '资产',
    sections: ['授权管理', '数据流向', '回报中心'],
    details: ['个人', '社区', 'AI 训练（非商业）', 'AI 训练（商业）', '撤回', '本条收益'],
  },
] as const

export type ProductTabId = typeof PRODUCT_TABS[number]['id']

export const PRIMARY_PRODUCT_FLOW = ['录音', '数据流向', '授权（可撤回）', '本条收益'] as const

