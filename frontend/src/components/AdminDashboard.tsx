import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Building2, AlertTriangle, Activity, MapPin, Brain } from "lucide-react";

// Mock data for analytics
const pharmacyData = [
  { name: "Rural Health Pharmacy", medicines: 45, lowStock: 2, revenue: 125000 },
  { name: "Community Medical Store", medicines: 38, lowStock: 5, revenue: 98000 },
  { name: "District Health Center", medicines: 67, lowStock: 3, revenue: 234000 },
  { name: "Village Care Pharmacy", medicines: 29, lowStock: 1, revenue: 87000 },
];

const demandTrends = [
  { month: "Jan", paracetamol: 450, insulin: 120, antibiotics: 280 },
  { month: "Feb", paracetamol: 520, insulin: 135, antibiotics: 310 },
  { month: "Mar", paracetamol: 480, insulin: 142, antibiotics: 290 },
  { month: "Apr", paracetamol: 610, insulin: 158, antibiotics: 340 },
  { month: "May", paracetamol: 580, insulin: 165, antibiotics: 320 },
  { month: "Jun", paracetamol: 650, insulin: 178, antibiotics: 380 },
];

const categoryDistribution = [
  { name: "Pain Relief", value: 35, color: "#3B82F6" },
  { name: "Diabetes", value: 25, color: "#10B981" },
  { name: "Antibiotics", value: 20, color: "#F59E0B" },
  { name: "Cardiovascular", value: 12, color: "#EF4444" },
  { name: "Others", value: 8, color: "#8B5CF6" },
];

const mlInsights = [
  {
    title: "Seasonal Demand Spike",
    description: "Pain relief medicines demand increases by 40% during monsoon season",
    impact: "High",
    recommendation: "Increase stock for Paracetamol, Aspirin by 35%"
  },
  {
    title: "Diabetes Medicine Shortage",
    description: "Insulin demand growing 8% monthly in rural areas",
    impact: "Critical", 
    recommendation: "Establish direct supplier contracts for consistent supply"
  },
  {
    title: "Antibiotic Usage Pattern",
    description: "Peak usage occurs during festival seasons due to food-borne illnesses",
    impact: "Medium",
    recommendation: "Stock up antibiotics 2 weeks before major festivals"
  }
];

export const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pharmacies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">24</div>
            <p className="text-xs text-medical-green mt-1">+2 this month</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1,247</div>
            <p className="text-xs text-medical-green mt-1">+156 this week</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-medical-red" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-medical-red">8</div>
            <p className="text-xs text-muted-foreground mt-1">Stock shortages</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">ML Accuracy</CardTitle>
              <Brain className="h-4 w-4 text-medical-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-medical-green">94.2%</div>
            <p className="text-xs text-medical-green mt-1">Prediction accuracy</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="pharmacies">Pharmacies</TabsTrigger>
          <TabsTrigger value="ml-insights">ML Insights</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Medicine Demand Trends</CardTitle>
                <CardDescription>Monthly demand for top medicines</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={demandTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="paracetamol" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="insulin" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="antibiotics" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Medicine Categories</CardTitle>
                <CardDescription>Distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {categoryDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Regional Performance</CardTitle>
              <CardDescription>Pharmacy performance metrics by region</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={pharmacyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="medicines" fill="#3B82F6" />
                  <Bar dataKey="lowStock" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pharmacies */}
        <TabsContent value="pharmacies" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Pharmacy Network</CardTitle>
              <CardDescription>Registered pharmacies and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pharmacyData.map((pharmacy, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{pharmacy.name}</h4>
                        <Badge className={pharmacy.lowStock > 3 ? "bg-medical-red-light text-medical-red" : "bg-medical-green-light text-medical-green"}>
                          {pharmacy.lowStock > 3 ? "Needs Attention" : "Good"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{pharmacy.medicines} medicines</span>
                        <span>{pharmacy.lowStock} low stock</span>
                        <span>Revenue: ₹{pharmacy.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">View Location</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ML Insights */}
        <TabsContent value="ml-insights" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Machine learning predictions and recommendations for rural healthcare management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mlInsights.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-foreground">{insight.title}</h4>
                      <Badge className={
                        insight.impact === 'Critical' ? "bg-medical-red-light text-medical-red" :
                        insight.impact === 'High' ? "bg-yellow-100 text-yellow-700" :
                        "bg-medical-green-light text-medical-green"
                      }>
                        {insight.impact} Impact
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{insight.description}</p>
                    <div className="p-3 bg-gradient-background rounded border-l-4 border-primary">
                      <p className="text-sm font-medium text-primary">Recommendation:</p>
                      <p className="text-sm text-foreground mt-1">{insight.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-medical rounded-lg text-primary-foreground">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5" />
                  <div>
                    <h4 className="font-semibold">Model Performance</h4>
                    <p className="text-sm opacity-90 mt-1">
                      The ML model has been trained on 2+ years of rural healthcare data and achieves 94.2% accuracy in predicting medicine demand patterns.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};