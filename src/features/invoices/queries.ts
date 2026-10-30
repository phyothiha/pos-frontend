import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelInvoice, collectPayment, createInvoice, getInvoice, getInvoices, updateInvoiceDelivery, type DeliveryStatus } from "./api";

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
    onSuccess: async (invoice) => {
      client.setQueryData(["invoices", invoice.id], invoice);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["invoices"] }),
        client.invalidateQueries({ queryKey: ["products"] }),
        client.invalidateQueries({ queryKey: ["inventory-movements"] }),
      ]);
    },
  });
}

export function useCancelInvoice(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => cancelInvoice(id),
    onSuccess: async (invoice) => {
      client.setQueryData(["invoices", id], invoice);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["invoices"] }),
        client.invalidateQueries({ queryKey: ["products"] }),
        client.invalidateQueries({ queryKey: ["inventory-movements"] }),
      ]);
    },
  });
}

export function useCollectPayment(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (platformId: number | null) => collectPayment(id, platformId),
    onSuccess: () => client.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUpdateInvoiceDelivery(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (status: DeliveryStatus) => updateInvoiceDelivery(id, status),
    onSuccess: async (invoice) => {
      client.setQueryData(["invoices", id], invoice);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["invoices"] }),
        client.invalidateQueries({ queryKey: ["products"] }),
        client.invalidateQueries({ queryKey: ["inventory-movements"] }),
      ]);
    },
  });
}
