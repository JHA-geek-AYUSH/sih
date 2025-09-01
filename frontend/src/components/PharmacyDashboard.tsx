import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, TrendingUp, AlertTriangle, Plus, Edit, Eye, Bell } from "lucide-react";
import { toast } from "sonner";

// Mock inventory data
const mockInventory = [
  { id: 1, name: "Paracetamol", stock: 45, minStock: 20, price: 12, category: "Pain Relief" },
  { id: 2, name: "Amoxicillin", stock: 12, minStock: 15, price: 85, category: "Antibiotic" },
  { id: 3, name: "Insulin", stock: 0, minStock: 10, price: 450, category: "Diabetes" },
  { id: 4, name: "Metformin", stock: 28, minStock: 25, price: 35, category: "Diabetes" },
  { id: 5, name: "Aspirin", stock: 5, minStock: 15, price: 8, category: "Pain Relief" },
];

// Mock ML predictions
const mockPredictions = [
  { medicine: "Paracetamol", currentStock: 45, predictedDemand: 30, daysLeft: 8, alert: "medium" },
  { medicine: "Amoxicillin", currentStock: 12, predictedDemand: 25, daysLeft: 3, alert: "high" },
  { medicine: "Insulin", currentStock: 0, predictedDemand: 15, daysLeft: 0, alert: "critical" },
  { medicine: "Metformin", currentStock: 28, predictedDemand: 20, daysLeft: 12, alert: "low" },
];

export const PharmacyDashboard = () => {
  const [inventory, setInventory] = useState(mockInventory);
  const [newMedicine, setNewMedicine] = useState({ name: "", stock: "", price: "", category: "" });

  const handleAddMedicine = () => {
    if (!newMedicine.name || !newMedicine.stock || !newMedicine.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    const medicine = {
      id: Date.now(),
      name: newMedicine.name,
      stock: parseInt(newMedicine.stock),
      minStock: 10,
      price: parseInt(newMedicine.price),
      category: newMedicine.category || "General"
    };

    setInventory([...inventory, medicine]);
    setNewMedicine({ name: "", stock: "", price: "", category: "" });
    toast.success(`Added ${medicine.name} to inventory`);
  };

  const handleUpdateStock = (id: number, newStock: number) => {
    setInventory(inventory.map(item => 
      item.id === id ? { ...item, stock: newStock } : item
    ));
    toast.success("Stock updated successfully");
  };

  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return { status: "critical", color: "bg-medical-red text-medical-red-light" };
    if (current < min) return { status: "low", color: "bg-medical-red-light text-medical-red" };
    if (current < min * 1.5) return { status: "medium", color: "bg-yellow-100 text-yellow-700" };
    return { status: "good", color: "bg-medical-green-light text-medical-green" };
  };

  const getPredictionAlert = (alert: string) => {
    switch (alert) {
      case 'critical': return { color: "bg-medical-red text-primary-foreground", icon: "🚨" };
      case 'high': return { color: "bg-medical-red-light text-medical-red", icon: "⚠️" };
      case 'medium': return { color: "bg-yellow-100 text-yellow-700", icon: "📊" };
      default: return { color: "bg-medical-green-light text-medical-green", icon: "✅" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{inventory.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active medicines</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-medical-red" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-medical-red">
              {inventory.filter(item => item.stock < item.minStock).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Need restocking</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-medical-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-medical-green">
              ₹{inventory.reduce((sum, item) => sum + (item.stock * item.price), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current inventory value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
          <TabsTrigger value="predictions">ML Predictions</TabsTrigger>
          <TabsTrigger value="add">Add Medicine</TabsTrigger>
        </TabsList>

        {/* Inventory Management */}
        <TabsContent value="inventory" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
              <CardDescription>Manage your medicine stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventory.map((item) => {
                  const stockStatus = getStockStatus(item.stock, item.minStock);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{item.name}</h4>
                          <Badge className={stockStatus.color}>
                            {stockStatus.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Category: {item.category}</span>
                          <span>Price: ₹{item.price}</span>
                          <span>Min Stock: {item.minStock}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{item.stock}</div>
                          <div className="text-xs text-muted-foreground">units</div>
                        </div>
                        <Input
                          type="number"
                          placeholder="Update stock"
                          className="w-24"
                          onBlur={(e) => {
                            const newStock = parseInt(e.target.value);
                            if (newStock >= 0) {
                              handleUpdateStock(item.id, newStock);
                              e.target.value = "";
                            }
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ML Predictions */}
        <TabsContent value="predictions" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Stock Prediction & Alerts
              </CardTitle>
              <CardDescription>
                AI-powered demand forecasting to prevent medicine shortages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPredictions.map((prediction, index) => {
                  const alert = getPredictionAlert(prediction.alert);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{prediction.medicine}</h4>
                          <Badge className={alert.color}>
                            {alert.icon} {prediction.alert.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Predicted demand: {prediction.predictedDemand} units in next 7 days
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">
                          {prediction.daysLeft} days
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Stock remaining
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-background rounded-lg border">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-primary">ML Recommendations</h4>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• Restock Insulin immediately - critical shortage predicted</li>
                      <li>• Order Amoxicillin within 2 days to avoid stockout</li>
                      <li>• Paracetamol demand expected to increase by 15% next week</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Medicine */}
        <TabsContent value="add" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add New Medicine
              </CardTitle>
              <CardDescription>Add a new medicine to your inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Medicine Name *</label>
                  <Input
                    placeholder="e.g., Paracetamol"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    placeholder="e.g., Pain Relief"
                    value={newMedicine.category}
                    onChange={(e) => setNewMedicine({...newMedicine, category: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Stock *</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newMedicine.stock}
                    onChange={(e) => setNewMedicine({...newMedicine, stock: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price per Unit (₹) *</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newMedicine.price}
                    onChange={(e) => setNewMedicine({...newMedicine, price: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleAddMedicine} className="bg-gradient-success shadow-success">
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};