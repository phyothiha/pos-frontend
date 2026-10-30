import { Routes, Route } from "react-router";
import { RequireAuth, GuestOnly } from "@/features/auth/auth-routes";
import Login from "@/pages/Login";
import { PanelShell } from "@/components/layout/panel-shell";
import { Dashboard } from "@/pages/dashboard";
import { Products } from "@/pages/inventory/product";
import { CreateProduct } from "@/pages/inventory/product/create";
import { Categories } from "@/pages/inventory/category";
import { Brands } from "@/pages/inventory/brand";
import { NotFound } from "@/pages/not-found";
import { Invoices } from "@/pages/inventory/invoice";
import { CreateInvoice } from "@/pages/inventory/invoice/create";
import { InvoiceDetails } from "@/pages/inventory/invoice/show";
import { PaymentPlatforms } from "@/pages/inventory/payment-platform";

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route index element={<Login />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<PanelShell />}>
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="products" element={<Products />} />
          <Route path="products/create" element={<CreateProduct />} />
          <Route path="categories" element={<Categories />} />
          <Route path="brands" element={<Brands />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/create" element={<CreateInvoice />} />
          <Route path="invoices/:id" element={<InvoiceDetails />} />
          <Route path="payment-platforms" element={<PaymentPlatforms />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
