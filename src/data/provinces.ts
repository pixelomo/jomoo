export interface Province {
  value: string
  label: string
}

// NOTE: this is still the mainland-China province list inherited from the
// original build. The site is now Japan-only, so these options need replacing
// with the 47 prefectures — pending confirmation from the client, because the
// stored `value` is what reaches their CRM.
export const PROVINCES: Province[] = [
  { value: 'beijing', label: '北京市' },
  { value: 'tianjin', label: '天津市' },
  { value: 'hebei', label: '河北省' },
  { value: 'shanxi', label: '山西省' },
  { value: 'neimenggu', label: '内蒙古自治区' },
  { value: 'liaoning', label: '遼寧省' },
  { value: 'jilin', label: '吉林省' },
  { value: 'heilongjiang', label: '黒竜江省' },
  { value: 'shanghai', label: '上海市' },
  { value: 'jiangsu', label: '江蘇省' },
  { value: 'zhejiang', label: '浙江省' },
  { value: 'anhui', label: '安徽省' },
  { value: 'fujian', label: '福建省' },
  { value: 'jiangxi', label: '江西省' },
  { value: 'shandong', label: '山東省' },
  { value: 'henan', label: '河南省' },
  { value: 'hubei', label: '湖北省' },
  { value: 'hunan', label: '湖南省' },
  { value: 'guangdong', label: '広東省' },
  { value: 'guangxi', label: '広西チワン族自治区' },
  { value: 'hainan', label: '海南省' },
  { value: 'chongqing', label: '重慶市' },
  { value: 'sichuan', label: '四川省' },
  { value: 'guizhou', label: '貴州省' },
  { value: 'yunnan', label: '雲南省' },
  { value: 'xizang', label: 'チベット自治区' },
  { value: 'shaanxi', label: '陝西省' },
  { value: 'gansu', label: '甘粛省' },
  { value: 'qinghai', label: '青海省' },
  { value: 'ningxia', label: '寧夏回族自治区' },
  { value: 'xinjiang', label: '新疆ウイグル自治区' },
]
