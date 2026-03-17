export const PART_COLORS: Record<string, { bg: string, text: string, border: string }> = {
  '1파트': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  '2파트': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  '3파트': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  '4파트': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  '5파트': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  '팀장': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '부팀장': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  '기타': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
};

export const STATUS_COLORS: Record<string, { bg: string, text: string }> = {
  'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'approved': { bg: 'bg-green-100', text: 'text-green-800' },
  'rejected': { bg: 'bg-red-100', text: 'text-red-800' },
};
