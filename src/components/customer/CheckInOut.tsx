import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  LogIn, 
  LogOut, 
  Clock,
  CalendarCheck
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { CheckIn } from "@/types";
import { cn } from "@/lib/utils";

interface CheckInOutProps {
  memberId: string;
  businessId: string;
}

export function CheckInOut({ memberId, businessId }: CheckInOutProps) {
  const [activeCheckIn, setActiveCheckIn] = useState<CheckIn | null>(null);
  const [todayCheckIns, setTodayCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isGymOpen, setIsGymOpen] = useState(false);
  const [gymStatus, setGymStatus] = useState('');

  const checkGymStatus = async () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const todayDate = format(now, 'yyyy-MM-dd');

    const [schedulesRes, holidaysRes]: any = await Promise.all([
      db.from('schedules').select('*').eq('business_id', businessId).eq('day_of_week', dayOfWeek).eq('is_open', true),
      db.from('holidays').select('*').eq('business_id', businessId).eq('date', todayDate),
    ]);

    if (holidaysRes.data && holidaysRes.data.length > 0) {
      setIsGymOpen(false);
      setGymStatus(`Closed - ${holidaysRes.data[0].reason || 'Holiday'}`);
      return;
    }

    if (!schedulesRes.data || schedulesRes.data.length === 0) {
      setIsGymOpen(false);
      setGymStatus('Closed - No schedule set');
      return;
    }

    // Gym is open if there's a schedule for today (ignore time restrictions)
    setIsGymOpen(true);
    const slot = schedulesRes.data[0];
    setGymStatus(`Open - ${slot.start_time} to ${slot.end_time}`);
  };

  const fetchCheckIns = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await db
      .from('check_ins')
      .select('*')
      .eq('member_id', memberId)
      .eq('business_id', businessId)
      .gte('check_in_time', today.toISOString())
      .order('check_in_time', { ascending: false });

    if (data) {
      setTodayCheckIns(data);
      const active = data.find(c => !c.check_out_time);
      setActiveCheckIn(active || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCheckIns();
    checkGymStatus();
  }, [memberId, businessId]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    
    const { error } = await db.from('check_ins').insert({
      member_id: memberId,
      business_id: businessId,
      check_in_time: new Date().toISOString(),
    });

    setActionLoading(false);

    if (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to check in');
    } else {
      toast.success('Checked in successfully!');
      fetchCheckIns();
    }
  };

  const handleCheckOut = async () => {
    if (!activeCheckIn) return;
    
    setActionLoading(true);
    
    const checkOutTime = new Date();
    const checkInTime = new Date(activeCheckIn.check_in_time);
    const durationMinutes = differenceInMinutes(checkOutTime, checkInTime);

    const { error } = await db
      .from('check_ins')
      .update({
        check_out_time: checkOutTime.toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq('id', activeCheckIn.id);

    setActionLoading(false);

    if (error) {
      console.error('Check-out error:', error);
      toast.error('Failed to check out');
    } else {
      toast.success(`Checked out! Duration: ${formatDuration(durationMinutes)}`);
      fetchCheckIns();
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTotalDuration = () => {
    return todayCheckIns.reduce((sum, c) => sum + (c.duration_minutes || 0), 0);
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground p-4">Loading...</div>;
  }

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Check-in / Check-out</h3>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          isGymOpen ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
        )}>
          {gymStatus}
        </div>
      </div>

      {}
      <div className="flex flex-col items-center py-4">
        {activeCheckIn ? (
          <>
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">Checked in at</p>
              <p className="text-2xl font-display font-semibold">
                {format(new Date(activeCheckIn.check_in_time), 'hh:mm a')}
              </p>
            </div>
            <Button
              onClick={handleCheckOut}
              disabled={actionLoading}
              size="lg"
              variant="destructive"
              className="rounded-xl w-full max-w-xs"
            >
              <LogOut className="w-5 h-5 mr-2" />
              {actionLoading ? 'Checking out...' : 'Check Out'}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleCheckIn}
            disabled={actionLoading || !isGymOpen}
            size="lg"
            className="rounded-xl w-full max-w-xs"
          >
            <LogIn className="w-5 h-5 mr-2" />
            {actionLoading ? 'Checking in...' : isGymOpen ? 'Check In' : 'Gym Closed'}
          </Button>
        )}
      </div>

      {}
      {todayCheckIns.length > 0 && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarCheck className="w-4 h-4" />
              Today's visits: {todayCheckIns.filter(c => c.check_out_time).length}
            </div>
            <div className="text-sm font-medium">
              Total: {formatDuration(getTotalDuration())}
            </div>
          </div>
          
          <div className="space-y-2">
            {todayCheckIns.map((checkIn) => (
              <div key={checkIn.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-2">
                <span>
                  {format(new Date(checkIn.check_in_time), 'hh:mm a')}
                  {checkIn.check_out_time && (
                    <span className="text-muted-foreground">
                      {' → '}{format(new Date(checkIn.check_out_time), 'hh:mm a')}
                    </span>
                  )}
                </span>
                {checkIn.duration_minutes && (
                  <span className="text-muted-foreground">
                    {formatDuration(checkIn.duration_minutes)}
                  </span>
                )}
                {!checkIn.check_out_time && (
                  <span className="text-success text-xs font-medium">Active</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

