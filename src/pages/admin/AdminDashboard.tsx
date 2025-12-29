import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAllUsers, useAIModels, useAdminPricingPlans } from '@/hooks/useAdmin';
import { Users, Bot, DollarSign, CreditCard, TrendingUp, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const { data: users } = useAllUsers();
  const { data: models } = useAIModels();
  const { data: plans } = useAdminPricingPlans();

  const totalUsers = users?.length || 0;
  const activeModels = models?.filter(m => m.is_active).length || 0;
  const activePlans = plans?.filter(p => p.is_active).length || 0;
  const totalCreditsDistributed = users?.reduce((acc, u) => acc + u.credits, 0) || 0;

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Active AI Models',
      value: activeModels,
      icon: Bot,
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Pricing Plans',
      value: activePlans,
      icon: DollarSign,
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'Total Credits',
      value: totalCreditsDistributed.toLocaleString(),
      icon: CreditCard,
      color: 'bg-info/10 text-info',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your platform's key metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users?.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{user.full_name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {user.credits} credits
                    </span>
                  </div>
                ))}
                {(!users || users.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">No users yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-success" />
                AI Model Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {models?.map((model) => (
                  <div key={model.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${model.is_active ? 'bg-success' : 'bg-muted'}`} />
                      <div>
                        <p className="font-medium text-foreground">{model.name}</p>
                        <p className="text-sm text-muted-foreground">{model.provider}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-success">{model.success_count} success</p>
                      <p className="text-sm text-destructive">{model.error_count} errors</p>
                    </div>
                  </div>
                ))}
                {(!models || models.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">No models configured</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
