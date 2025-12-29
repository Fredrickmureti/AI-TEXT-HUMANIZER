import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  useAIModels, 
  useUpdateAIModel, 
  useCreateAIModel,
  useDeleteAIModel,
  useTestAIModel,
  AIModel 
} from '@/hooks/useAdmin';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Bot, 
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle 
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const providers = [
  { value: 'lovable', label: 'Lovable AI Gateway' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google AI' },
  { value: 'custom', label: 'Custom Endpoint' },
];

export default function AdminModels() {
  const { data: models, isLoading } = useAIModels();
  const updateModel = useUpdateAIModel();
  const createModel = useCreateAIModel();
  const deleteModel = useDeleteAIModel();
  const testModel = useTestAIModel();
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    provider: 'lovable',
    model_id: '',
    api_key_encrypted: '',
    api_endpoint: '',
    is_active: true,
    priority: 1,
    is_default: false,
    rate_limit_per_minute: 60,
  });

  const handleCreateModel = async () => {
    await createModel.mutateAsync(newModel);
    setIsCreateOpen(false);
    setNewModel({
      name: '',
      provider: 'lovable',
      model_id: '',
      api_key_encrypted: '',
      api_endpoint: '',
      is_active: true,
      priority: 1,
      is_default: false,
      rate_limit_per_minute: 60,
    });
  };

  const handleUpdateModel = async () => {
    if (!editingModel) return;
    
    await updateModel.mutateAsync({
      id: editingModel.id,
      name: editingModel.name,
      provider: editingModel.provider,
      model_id: editingModel.model_id,
      api_key_encrypted: editingModel.api_key_encrypted,
      api_endpoint: editingModel.api_endpoint,
      is_active: editingModel.is_active,
      priority: editingModel.priority,
      is_default: editingModel.is_default,
      rate_limit_per_minute: editingModel.rate_limit_per_minute,
    });
    
    setEditingModel(null);
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
            <h1 className="text-3xl font-bold text-foreground">AI Models</h1>
            <p className="text-muted-foreground mt-1">
              Manage AI models with automatic fallback when rate limits are hit.
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Model
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add AI Model</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Model Name</Label>
                  <Input
                    value={newModel.name}
                    onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                    placeholder="GPT-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select value={newModel.provider} onValueChange={(v) => setNewModel({ ...newModel, provider: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Model ID</Label>
                  <Input
                    value={newModel.model_id}
                    onChange={(e) => setNewModel({ ...newModel, model_id: e.target.value })}
                    placeholder="gpt-4 or google/gemini-2.5-flash"
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Key (leave empty for Lovable AI)</Label>
                  <Input
                    type="password"
                    value={newModel.api_key_encrypted}
                    onChange={(e) => setNewModel({ ...newModel, api_key_encrypted: e.target.value })}
                    placeholder="sk-..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Endpoint (optional)</Label>
                  <Input
                    value={newModel.api_endpoint}
                    onChange={(e) => setNewModel({ ...newModel, api_endpoint: e.target.value })}
                    placeholder="https://api.openai.com/v1/chat/completions"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority (lower = higher priority)</Label>
                    <Input
                      type="number"
                      value={newModel.priority}
                      onChange={(e) => setNewModel({ ...newModel, priority: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rate Limit (req/min)</Label>
                    <Input
                      type="number"
                      value={newModel.rate_limit_per_minute}
                      onChange={(e) => setNewModel({ ...newModel, rate_limit_per_minute: parseInt(e.target.value) || 60 })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newModel.is_default}
                      onCheckedChange={(checked) => setNewModel({ ...newModel, is_default: checked })}
                    />
                    <Label>Default Model</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newModel.is_active}
                      onCheckedChange={(checked) => setNewModel({ ...newModel, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
                <Button onClick={handleCreateModel} className="w-full" disabled={createModel.isPending}>
                  {createModel.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Add Model
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-info/5 border-info/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-info mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Automatic Fallback System</p>
                <p className="text-sm text-muted-foreground">
                  When a model hits its rate limit, the system automatically switches to the next available model based on priority.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {models?.map((model) => (
            <Card key={model.id} className={!model.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${model.is_active ? 'bg-success/10' : 'bg-muted'}`}>
                      <Bot className={`w-5 h-5 ${model.is_active ? 'text-success' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {model.name}
                        {model.is_default && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Default</span>
                        )}
                      </CardTitle>
                      <CardDescription>{model.provider} • {model.model_id}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testModel.mutate(model.id)}
                      disabled={testModel.isPending}
                    >
                      {testModel.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test'}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditingModel(model)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Edit Model: {editingModel?.name}</DialogTitle>
                        </DialogHeader>
                        {editingModel && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Model Name</Label>
                              <Input
                                value={editingModel.name}
                                onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Provider</Label>
                              <Select value={editingModel.provider} onValueChange={(v) => setEditingModel({ ...editingModel, provider: v })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {providers.map(p => (
                                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Model ID</Label>
                              <Input
                                value={editingModel.model_id}
                                onChange={(e) => setEditingModel({ ...editingModel, model_id: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>API Key</Label>
                              <Input
                                type="password"
                                value={editingModel.api_key_encrypted || ''}
                                onChange={(e) => setEditingModel({ ...editingModel, api_key_encrypted: e.target.value })}
                                placeholder="Leave empty to keep current"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>API Endpoint</Label>
                              <Input
                                value={editingModel.api_endpoint || ''}
                                onChange={(e) => setEditingModel({ ...editingModel, api_endpoint: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Priority</Label>
                                <Input
                                  type="number"
                                  value={editingModel.priority}
                                  onChange={(e) => setEditingModel({ ...editingModel, priority: parseInt(e.target.value) || 1 })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Rate Limit</Label>
                                <Input
                                  type="number"
                                  value={editingModel.rate_limit_per_minute}
                                  onChange={(e) => setEditingModel({ ...editingModel, rate_limit_per_minute: parseInt(e.target.value) || 60 })}
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={editingModel.is_default}
                                  onCheckedChange={(checked) => setEditingModel({ ...editingModel, is_default: checked })}
                                />
                                <Label>Default</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={editingModel.is_active}
                                  onCheckedChange={(checked) => setEditingModel({ ...editingModel, is_active: checked })}
                                />
                                <Label>Active</Label>
                              </div>
                            </div>
                            <Button onClick={handleUpdateModel} className="w-full" disabled={updateModel.isPending}>
                              {updateModel.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
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
                          <AlertDialogTitle>Delete {model.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the AI model from the fallback system.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteModel.mutate(model.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Priority:</span>
                    <span className="font-medium text-foreground">{model.priority}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Rate Limit:</span>
                    <span className="font-medium text-foreground">{model.rate_limit_per_minute}/min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-success">{model.success_count}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="text-destructive">{model.error_count}</span>
                  </div>
                  {model.last_error && (
                    <div className="flex items-center gap-2 text-warning">
                      <AlertCircle className="w-4 h-4" />
                      <span className="truncate max-w-xs">{model.last_error}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
