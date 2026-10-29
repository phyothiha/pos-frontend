import { Routes, Route } from "react-router";
import Login from "@/pages/Login";
import { PanelShell } from "@/components/layout/panel-shell";
import { Dashboard } from "@/pages/dashboard";
import { Products } from "@/pages/inventory/product";
import { CreateProduct } from "@/pages/inventory/product/create";
import { Categories } from "@/pages/inventory/category";
import { Brands } from "@/pages/inventory/brand";
import { NotFound } from "@/pages/not-found";

export default function App() {
  return (
    <Routes>
      <Route index element={<Login />} />

      <Route element={<PanelShell />}>
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="products" element={<Products />} />
        <Route path="products/create" element={<CreateProduct />} />
        <Route path="categories" element={<Categories />} />
        <Route path="brands" element={<Brands />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
