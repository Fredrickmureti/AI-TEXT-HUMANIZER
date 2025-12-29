import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, CreditCard, Shield, Users, Loader2 } from 'lucide-react';
import { useSystemSetting, useUpdateSystemSetting } from '@/hooks/useSystemSettings';

export default function AdminSettings() {
  const { data: creditsSetting, isLoading } = useSystemSetting('default_user_credits');
  const updateSetting = useUpdateSystemSetting();
  const [defaultCredits, setDefaultCredits] = useState('100');

  useEffect(() => {
    if (creditsSetting?.value !== undefined) {
      setDefaultCredits(String(creditsSetting.value));
    }
  }, [creditsSetting]);

  const handleSaveCredits = () => {
    const value = parseInt(defaultCredits, 10);
    if (isNaN(value) || value < 0) return;
    updateSetting.mutate({ key: 'default_user_credits', value });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure system-wide settings.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>User Defaults</CardTitle>
                <CardDescription>Configure default settings for new users</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="defaultCredits" className="text-foreground">Default Credits for New Users</Label>
                <p className="text-sm text-muted-foreground">
                  Number of free credits given to new users upon registration
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Input
                      id="defaultCredits"
                      type="number"
                      min="0"
                      value={defaultCredits}
                      onChange={(e) => setDefaultCredits(e.target.value)}
                      className="w-24"
                    />
                    <Button 
                      onClick={handleSaveCredits}
                      disabled={updateSetting.isPending}
                      size="sm"
                    >
                      {updateSetting.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Save'
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Payment Providers</CardTitle>
                <CardDescription>Configure payment gateway settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">PayPal</Label>
                <p className="text-sm text-muted-foreground">Accept PayPal payments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
              <p className="text-sm text-success">PayPal is configured and ready to accept payments.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-warning" />
              </div>
              <div>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Application-wide configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Disable access for non-admins</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">New User Signups</Label>
                <p className="text-sm text-muted-foreground">Allow new users to register</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Security and access control settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
