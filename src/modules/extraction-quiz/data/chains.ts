export type CalciumBoneChain = {
  chainId: string;
  label: string;
};

export const CALCIUM_BONE_CHAINS: readonly CalciumBoneChain[] = [
  { chainId: "CAL-BONE-01", label: "Calcium & Bone Physiology" },
  { chainId: "CAL-BONE-02", label: "Rickets & Osteomalacia" },
  { chainId: "CAL-BONE-03", label: "Osteoporosis" },
  { chainId: "CAL-BONE-04", label: "Paget's Disease" },
  { chainId: "CAL-BONE-05", label: "Osteogenesis Imperfecta" },
  { chainId: "CAL-HYP-01", label: "Hypercalcaemia (selected causes)" },
  { chainId: "CAL-HYPO-01", label: "Hypocalcaemia" },
  { chainId: "CAL-MG-01", label: "Hypomagnesaemia" },
  { chainId: "CAL-PTH-01", label: "Primary Hyperparathyroidism" },
] as const;

export function findChainById(chainId: string | null): CalciumBoneChain | null {
  if (!chainId) return null;
  return CALCIUM_BONE_CHAINS.find((c) => c.chainId === chainId) ?? null;
}
