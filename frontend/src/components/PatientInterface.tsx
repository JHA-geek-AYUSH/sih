import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

// Mock medicine data
const mockMedicines = [
  { 
    id: 1, 
    name: "Paracetamol", 
    pharmacy: "Rural Health Pharmacy",
    location: "Village Center, 2 km",
    stock: 45,
    price: "₹12",
    status: "available" as const
  },
  { 
    id: 2, 
    name: "Amoxicillin", 
    pharmacy: "Community Medical Store",
    location: "Main Road, 5 km",
    stock: 12,
    price: "₹85",
    status: "low" as const
  },
  { 
    id: 3, 
    name: "Insulin", 
    pharmacy: "District Health Center",
    location: "Town Square, 8 km",
    stock: 0,
    price: "₹450",
    status: "out-of-stock" as const
  },
  { 
    id: 4, 
    name: "Metformin", 
    pharmacy: "Rural Health Pharmacy",
    location: "Village Center, 2 km",
    stock: 28,
    price: "₹35",
    status: "available" as const
  }
];

export const PatientInterface = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState(mockMedicines);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setResults(mockMedicines);
      return;
    }
    
    const filtered = mockMedicines.filter(medicine =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filtered);
  };

  const handleReserve = (medicineName: string, pharmacy: string) => {
    toast.success(`Reserved ${medicineName} at ${pharmacy}`, {
      description: "You'll receive a confirmation SMS shortly"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-medical-green" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-medical-red" />;
      case 'out-of-stock':
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string, stock: number) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-medical-green-light text-medical-green">Available ({stock})</Badge>;
      case 'low':
        return <Badge className="bg-medical-red-light text-medical-red">Low Stock ({stock})</Badge>;
      case 'out-of-stock':
        return <Badge variant="secondary">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-background shadow-card border-0">
        <CardHeader className="text-center py-8">
          <CardTitle className="text-2xl font-bold text-primary">
            Find Medicine Near You
          </CardTitle>
          <CardDescription className="text-lg">
            Check real-time availability at rural pharmacies in your area
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Search Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search Medicine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter medicine name (e.g., Paracetamol, Insulin)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="bg-gradient-medical shadow-medical">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="grid gap-4">
        {results.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No medicines found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          results.map((medicine) => (
            <Card key={medicine.id} className="shadow-card hover:shadow-medical transition-smooth">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(medicine.status)}
                      <h3 className="text-xl font-semibold text-foreground">{medicine.name}</h3>
                      {getStatusBadge(medicine.status, medicine.stock)}
                    </div>
                    
                    <div className="space-y-2 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{medicine.pharmacy} - {medicine.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-primary">{medicine.price}</span>
                        <span>per unit</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {medicine.status === 'out-of-stock' ? (
                      <Button variant="outline" disabled>
                        Out of Stock
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleReserve(medicine.name, medicine.pharmacy)}
                        className="bg-gradient-success shadow-success"
                      >
                        Reserve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Help Section */}
      <Card className="bg-secondary shadow-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Clock className="h-6 w-6 text-primary mt-1" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">How it works</h4>
              <ul className="space-y-1 text-muted-foreground text-sm">
                <li>• Search for your required medicine</li>
                <li>• Check real-time availability and prices</li>
                <li>• Reserve medicine at nearest pharmacy</li>
                <li>• Receive SMS confirmation with pickup details</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};