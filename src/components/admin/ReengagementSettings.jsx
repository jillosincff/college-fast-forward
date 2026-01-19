import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Mail, 
  Settings, 
  RefreshCw, 
  Loader2, 
  CheckCircle,
  Eye,
  Users,
  TrendingUp,
  MousePointer,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getReengagementStats } from '@/functions/getReengagementStats';
import { updateReengagementSettings } from '@/functions/updateReengagementSettings';

export default function ReengagementSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSettings, setEditSettings] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await getReengagementStats({});
      if (response.data?.success) {
        setData(response.data);
      } else {
        throw new Error(response.data?.error || 'Failed to load stats');
      }
    } catch (error) {
      console.error('Load stats error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load re-engagement stats",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditSettings({ ...data.settings });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateReengagementSettings({
        settings_id: editSettings.id,
        enabled: editSettings.enabled,
        day1_threshold: editSettings.day1_threshold,
        day2_threshold: editSettings.day2_threshold,
        day3_threshold: editSettings.day3_threshold,
        stop_threshold: editSettings.stop_threshold,
        max_emails_per_day: editSettings.max_emails_per_day
      });

      if (response.data?.success) {
        toast({
          title: "✅ Settings Saved",
          description: editSettings.enabled ? "Re-engagement emails are now enabled" : "Settings updated successfully"
        });
        setShowEditModal(false);
        loadStats();
      } else {
        throw new Error(response.data?.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
        <p className="text-slate-600">Loading re-engagement settings...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Mail className="w-12 h-12 mx-auto mb-2 text-slate-300" />
        <p>Could not load re-engagement data</p>
        <Button onClick={loadStats} className="mt-4">Try Again</Button>
      </div>
    );
  }

  const { settings, eligible_users, stats_30d, stats_by_type, total_parents } = data;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-600" />
              Re-Engagement Email Settings
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Automatically email inactive parents when students post matching questions
            </p>
          </div>
          <Button onClick={loadStats} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
      </Card>

      {/* School Settings Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">School</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Emails Sent (30d)</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Open Rate</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Eligible Now</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <span className="font-medium text-slate-900">🐊 {settings.school_name}</span>
                  </td>
                  <td className="px-4 py-4">
                    {settings.enabled ? (
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Enabled
                        </span>
                        {settings.enabled_at && (
                          <p className="text-xs text-slate-400 mt-1">
                            Since {new Date(settings.enabled_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {settings.enabled ? stats_30d.emails_sent : '—'}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {stats_30d.open_rate !== null ? `${stats_30d.open_rate}%` : '—'}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {eligible_users.total} parents
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button
                      onClick={handleEdit}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stats Panel (when enabled) */}
      {settings.enabled && stats_30d.emails_sent > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 Performance (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats_30d.emails_sent}</p>
                <p className="text-xs text-slate-600">Emails Sent</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{stats_30d.open_rate || 0}%</p>
                <p className="text-xs text-slate-600">Open Rate</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <MousePointer className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-purple-600">{stats_30d.click_rate || 0}%</p>
                <p className="text-xs text-slate-600">Click Rate</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">{stats_30d.conversion_rate || 0}%</p>
                <p className="text-xs text-slate-600">Answered</p>
              </div>
            </div>

            {/* By email type */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">By Email Type:</h4>
              <div className="space-y-2 text-sm">
                {['day7', 'day21', 'day45'].map(type => {
                  const typeStats = stats_by_type[type];
                  if (!typeStats || typeStats.sent === 0) return null;
                  const openRate = typeStats.sent > 0 ? Math.round((typeStats.opened / typeStats.sent) * 100) : 0;
                  const clickRate = typeStats.opened > 0 ? Math.round((typeStats.clicked / typeStats.opened) * 100) : 0;
                  const convRate = typeStats.clicked > 0 ? Math.round((typeStats.converted / typeStats.clicked) * 100) : 0;
                  
                  return (
                    <div key={type} className="flex items-center gap-4 text-slate-600">
                      <span className="w-16 font-medium">Day {type.replace('day', '')}:</span>
                      <span>{typeStats.sent} sent</span>
                      <span>→</span>
                      <span>{openRate}% open</span>
                      <span>→</span>
                      <span>{clickRate}% click</span>
                      <span>→</span>
                      <span>{convRate}% answered</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eligible Users Preview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Eligible Users Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center border">
              <p className="text-2xl font-bold text-slate-900">{total_parents}</p>
              <p className="text-xs text-slate-600">Total Parents/Alumni</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border">
              <p className="text-2xl font-bold text-orange-600">{eligible_users.day1}</p>
              <p className="text-xs text-slate-600">Day {settings.day1_threshold} eligible</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border">
              <p className="text-2xl font-bold text-orange-600">{eligible_users.day2}</p>
              <p className="text-xs text-slate-600">Day {settings.day2_threshold} eligible</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border">
              <p className="text-2xl font-bold text-orange-600">{eligible_users.day3}</p>
              <p className="text-xs text-slate-600">Day {settings.day3_threshold} eligible</p>
            </div>
          </div>
          <p className="text-sm text-blue-700 mt-4">
            📊 <strong>{eligible_users.total} parents</strong> are currently eligible to receive re-engagement emails
          </p>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Re-Engagement Settings: {settings.school_name}</DialogTitle>
          </DialogHeader>

          {editSettings && (
            <div className="space-y-6 py-4">
              {/* Enable Toggle */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Enable Re-Engagement Emails
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setEditSettings({ ...editSettings, enabled: false })}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      !editSettings.enabled 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    ○ Disabled
                  </button>
                  <button
                    onClick={() => setEditSettings({ ...editSettings, enabled: true })}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      editSettings.enabled 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    ● Enabled
                  </button>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Timing Settings */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Timing Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">First email after</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editSettings.day1_threshold}
                        onChange={(e) => setEditSettings({ ...editSettings, day1_threshold: parseInt(e.target.value) || 7 })}
                        className="w-20"
                      />
                      <span className="text-slate-500 text-sm">days inactive</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Second email after</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editSettings.day2_threshold}
                        onChange={(e) => setEditSettings({ ...editSettings, day2_threshold: parseInt(e.target.value) || 21 })}
                        className="w-20"
                      />
                      <span className="text-slate-500 text-sm">days inactive</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Third email after</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editSettings.day3_threshold}
                        onChange={(e) => setEditSettings({ ...editSettings, day3_threshold: parseInt(e.target.value) || 45 })}
                        className="w-20"
                      />
                      <span className="text-slate-500 text-sm">days inactive</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Stop emailing after</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editSettings.stop_threshold}
                        onChange={(e) => setEditSettings({ ...editSettings, stop_threshold: parseInt(e.target.value) || 60 })}
                        className="w-20"
                      />
                      <span className="text-slate-500 text-sm">days inactive</span>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Daily Limits */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Daily Limits</h3>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Max emails per day</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={editSettings.max_emails_per_day}
                      onChange={(e) => setEditSettings({ ...editSettings, max_emails_per_day: parseInt(e.target.value) || 100 })}
                      className="w-24"
                    />
                    <span className="text-slate-400 text-sm">(prevents overwhelming your email service)</span>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Preview */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Preview</h3>
                <p className="text-sm text-slate-600">
                  📊 Eligible users right now: <span className="font-semibold">{eligible_users.total} parents</span>
                </p>
                <ul className="text-sm text-slate-500 mt-2 space-y-1">
                  <li>• Day {editSettings.day1_threshold} eligible: {eligible_users.day1}</li>
                  <li>• Day {editSettings.day2_threshold} eligible: {eligible_users.day2}</li>
                  <li>• Day {editSettings.day3_threshold} eligible: {eligible_users.day3}</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className={editSettings.enabled ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">ℹ️ How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>
            <strong>When enabled:</strong> A daily job runs at 9am and sends personalized emails to inactive parents/alumni 
            who have matching questions from students.
          </p>
          <p>
            <strong>Email sequence:</strong> Day 7 → Day 21 → Day 45, then stops. Each email shows 1-3 matched questions.
          </p>
          <p>
            <strong>Smart filtering:</strong> Only sends if user has 2+ matched questions, hasn't received an email in 7 days, 
            and hasn't ignored 3+ previous emails.
          </p>
          <p>
            <strong>Reset on activity:</strong> When a user logs in or answers a question, their re-engagement state resets.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}