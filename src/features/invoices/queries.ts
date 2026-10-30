import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { collectPayment, createInvoice, getInvoice, getInvoices } from "./api";

export function useInvoices(page = 1) {
  return useQuery({
    queryKey: ["invoices", { page }],
    queryFn: ({ signal }) => getInvoices(page, signal),
  });
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: ({ signal }) => getInvoice(id, signal),
    enabled: Number.isSafeInteger(id) && id > 0,
  });
}

export function useCreateInvoice() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => client.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useCollectPayment(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (platformId: number | null) => collectPayment(id, platformId),
    onSuccess: () => client.invalidateQueries({ queryKey: ["invoices"] }),
  });
}
