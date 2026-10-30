import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import { searchProducts, type Product } from "@/features/products/api";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

export function ProductPicker({
  onSelect,
  disabled,
}: {
  onSelect: (product: Product) => void;
  disabled: boolean;
}) {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const updateSearch = useMemo(
    () => debounce((value: string) => setSearch(value.trim()), 300),
    [],
  );
  useEffect(() => () => updateSearch.cancel(), [updateSearch]);
  const products = useQuery({
    queryKey: ["products", "search", search],
    queryFn: ({ signal }) => searchProducts(search, signal),
    enabled: search.length > 0,
  });
  const waiting = input.trim() !== search || products.isFetching;
  const items =
    input.trim() && !waiting && !products.isError ? (products.data ?? []) : [];

  return (
    <Combobox
      items={items}
      filter={null}
      value={null}
      inputValue={input}
      disabled={disabled}
      itemToStringLabel={(product: Product) =>
        `${product.name} (${product.sku})`
      }
      onInputValueChange={(value, details) => {
        if (details.reason !== "input-change") return;
        setInput(value);
        updateSearch(value);
      }}
      onValueChange={(product) => {
        if (!product) return;
        onSelect(product);
        updateSearch.cancel();
        setInput("");
        setSearch("");
      }}
    >
      <ComboboxInput
        aria-label="Search products by name or SKU"
        placeholder="Search products by name or SKU..."
      />
      <ComboboxContent>
        <ComboboxEmpty>
          {!input.trim()
            ? "Type a product name or SKU."
            : waiting
              ? "Searching..."
              : products.isError
                ? "Failed to search products. Try again."
                : "No products found."}
        </ComboboxEmpty>
        <ComboboxList>
          {(product: Product) => (
            <ComboboxItem key={product.id} value={product}>
              <div className="flex flex-col">
                <span>
                  {product.name} · {product.sku}
                </span>
                <span className="text-xs text-muted-foreground">
                  {product.selling_price.toLocaleString()} MMK ·{" "}
                  {product.type === "pre_order"
                    ? "Pre-Order"
                    : "In Stock"}
                  {` · Available: ${product.stock_quantity}`}
                </span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
