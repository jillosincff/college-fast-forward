import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function ImpactSettings() {
    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Settings</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="monthly-recap" className="flex-grow pr-4">Monthly impact recap email</Label>
                    <Switch id="monthly-recap" />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="anon-stories" className="flex-grow pr-4">Allow anonymous stories from students I've helped</Label>
                    <Switch id="anon-stories" defaultChecked />
                </div>
            </div>
        </div>
    );
}