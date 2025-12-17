import React, { useState, useMemo } from 'react';
import { useProductStore } from '../store/productStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Package, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';

interface SupplierStats {
  name: string;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  averagePrice: number;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

const Fournisseurs: React.FC = () => {
  const { products } = useProductStore();
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  // Analyze purchases by supplier
  const supplierStats = useMemo(() => {
    const statsMap = new Map<string, SupplierStats>();

    products.forEach((product) => {
      const supplier = product.supplier || 'Non spécifié';
      
      if (!statsMap.has(supplier)) {
        statsMap.set(supplier, {
          name: supplier,
          totalProducts: 0,
          totalQuantity: 0,
          totalValue: 0,
          averagePrice: 0,
          products: [],
        });
      }

      const stats = statsMap.get(supplier)!;
      const totalPrice = product.purchasePrice * product.quantity;

      stats.totalProducts += 1;
      stats.totalQuantity += product.quantity;
      stats.totalValue += totalPrice;
      stats.products.push({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        unitPrice: product.purchasePrice,
        totalPrice,
      });
    });

    // Calculate average prices
    statsMap.forEach((stats) => {
      stats.averagePrice = stats.totalValue / stats.totalQuantity;
      // Sort products by total price descending
      stats.products.sort((a, b) => b.totalPrice - a.totalPrice);
    });

    // Convert to array and sort by total value descending
    return Array.from(statsMap.values()).sort((a, b) => b.totalValue - a.totalValue);
  }, [products]);

  // Overall statistics
  const overallStats = useMemo(() => {
    return {
      totalSuppliers: supplierStats.length,
      totalProducts: products.length,
      totalQuantity: supplierStats.reduce((sum, s) => sum + s.totalQuantity, 0),
      totalValue: supplierStats.reduce((sum, s) => sum + s.totalValue, 0),
    };
  }, [supplierStats, products.length]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analyse Fournisseurs</h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble des achats par fournisseur
        </p>
      </div>

      {/* Overall Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fournisseurs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">Fournisseurs actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits Total</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Articles différents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantité Totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overallStats.totalQuantity)}</div>
            <p className="text-xs text-muted-foreground">Unités en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallStats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Coût d'achat total</p>
          </CardContent>
        </Card>
      </div>

      {/* Supplier List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {supplierStats.map((supplier) => (
          <Card
            key={supplier.name}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedSupplier(selectedSupplier === supplier.name ? null : supplier.name)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{supplier.name}</span>
                <Package className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Produits</p>
                    <p className="text-lg font-semibold">{supplier.totalProducts}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantité</p>
                    <p className="text-lg font-semibold">{formatNumber(supplier.totalQuantity)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Valeur totale</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(supplier.totalValue)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Prix moyen unitaire</p>
                  <p className="text-lg font-semibold">{formatCurrency(supplier.averagePrice)}</p>
                </div>

                <div className="pt-2">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(supplier.totalValue / overallStats.totalValue) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((supplier.totalValue / overallStats.totalValue) * 100).toFixed(1)}% du total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Supplier Details */}
      {selectedSupplier && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Détail des produits - {selectedSupplier}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Produit</th>
                    <th className="text-right py-3 px-4 font-medium">Quantité</th>
                    <th className="text-right py-3 px-4 font-medium">Prix unitaire</th>
                    <th className="text-right py-3 px-4 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierStats
                    .find((s) => s.name === selectedSupplier)
                    ?.products.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="text-right py-3 px-4">{formatNumber(product.quantity)}</td>
                        <td className="text-right py-3 px-4">{formatCurrency(product.unitPrice)}</td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {formatCurrency(product.totalPrice)}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td className="py-3 px-4">Total</td>
                    <td className="text-right py-3 px-4">
                      {formatNumber(
                        supplierStats.find((s) => s.name === selectedSupplier)?.totalQuantity || 0
                      )}
                    </td>
                    <td className="text-right py-3 px-4">-</td>
                    <td className="text-right py-3 px-4 text-primary">
                      {formatCurrency(
                        supplierStats.find((s) => s.name === selectedSupplier)?.totalValue || 0
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {supplierStats.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun fournisseur</h3>
            <p className="text-muted-foreground text-center">
              Ajoutez des produits avec des fournisseurs pour voir les statistiques ici.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Fournisseurs;