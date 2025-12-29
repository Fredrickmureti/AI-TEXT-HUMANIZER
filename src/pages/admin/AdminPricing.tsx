import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  useAdminPricingPlans, 
  useUpdatePricingPlan, 
  useCreatePricingPlan,
  useDeletePricingPlan,
  PricingPlan 
} from '@/hooks/useAdmin';
import { Plus, Edit, Trash2, Loader2, DollarSign, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AdminPricing() {
  const { data: plans, isLoading } = useAdminPricingPlans();
  const updatePlan = useUpdatePricingPlan();
  const createPlan = useCreatePricingPlan();
  const deletePlan = useDeletePricingPlan();
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: 0,
    credits: 0,
    features: '',
    is_active: true,
    is_popular: false,
    sort_order: 0,
  });

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;
    
    await updatePlan.mutateAsync({
      id: editingPlan.id,
      name: editingPlan.name,
      description: editingPlan.description,
      price: editingPlan.price,
      credits: editingPlan.credits,
      features: editingPlan.features,
      is_active: editingPlan.is_active,
      is_popular: editingPlan.is_popular,
      sort_order: editingPlan.sort_order,
    });
    
    setEditingPlan(null);
  };

  const handleCreatePlan = async () => {
    await createPlan.mutateAsync({
      ...newPlan,
      features: newPlan.features.split('\n').filter(f => f.trim()),
    });
    
    setIsCreateOpen(false);
    setNewPlan({
      name: '',
      description: '',
      price: 0,
      credits: 0,
      features: '',
      is_active: true,
      is_popular: false,
      sort_order: 0,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pricing Plans</h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription plans and pricing.
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    placeholder="Pro Plan"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                    placeholder="For professionals"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newPlan.price}
                      onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Credits</Label>
                    <Input
                      type="number"
                      value={newPlan.credits}
                      onChange={(e) => setNewPlan({ ...newPlan, credits: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Features (one per line)</Label>
                  <Textarea
                    value={newPlan.features}
                    onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    rows={4}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newPlan.is_popular}
                      onCheckedChange={(checked) => setNewPlan({ ...newPlan, is_popular: checked })}
                    />
                    <Label>Popular</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newPlan.is_active}
                      onCheckedChange={(checked) => setNewPlan({ ...newPlan, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
                <Button onClick={handleCreatePlan} className="w-full" disabled={createPlan.isPending}>
                  {createPlan.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans?.map((plan) => (
            <Card key={plan.id} className={`relative ${!plan.is_active ? 'opacity-60' : ''}`}>
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditingPlan(plan)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Plan: {editingPlan?.name}</DialogTitle>
                        </DialogHeader>
                        {editingPlan && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Plan Name</Label>
                              <Input
                                value={editingPlan.name}
                                onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Input
                                value={editingPlan.description || ''}
                                onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Price (USD)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editingPlan.price}
                                  onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) || 0 })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Credits</Label>
                                <Input
                                  type="number"
                                  value={editingPlan.credits}
                                  onChange={(e) => setEditingPlan({ ...editingPlan, credits: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Features (one per line)</Label>
                              <Textarea
                                value={editingPlan.features.join('\n')}
                                onChange={(e) => setEditingPlan({ 
                                  ...editingPlan, 
                                  features: e.target.value.split('\n').filter(f => f.trim())
                                })}
                                rows={4}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={editingPlan.is_popular}
                                  onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, is_popular: checked })}
                                />
                                <Label>Popular</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={editingPlan.is_active}
                                  onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, is_active: checked })}
                                />
                                <Label>Active</Label>
                              </div>
                            </div>
                            <Button onClick={handleUpdatePlan} className="w-full" disabled={updatePlan.isPending}>
                              {updatePlan.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                              Save Changes
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {plan.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the pricing plan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletePlan.mutate(plan.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-2">
                  ${plan.price}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="text-sm font-medium text-foreground mb-2">
                  {plan.credits.toLocaleString()} credits
                </div>
                <ul className="space-y-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {feature}</li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${plan.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
