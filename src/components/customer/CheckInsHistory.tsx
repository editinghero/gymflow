import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Clock } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { db } from "@/lib/db";

interface CheckIn {
  id: string;
  check_in_time: string;
  check_out_time: string | null;
  duration_minutes: number | null;
}

interface CheckInsHistoryProps {
  memberId: string;
  businessId: string;
}

export function CheckInsHistory({ memberId, businessId }: CheckInsHistoryProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [checkInsRes, holidaysRes]: any = await Promise.all([
        db.from('check_ins').select('*').eq('member_id', memberId).order('check_in_time', { ascending: false }),
        db.from('holidays').select('date').eq('business_id', businessId),
      ]);

      if (checkInsRes.data) setCheckIns(checkInsRes.data);
      if (holidaysRes.data) setHolidays(holidaysRes.data.map((h: any) => h.date));
      setLoading(false);
    };

    fetchData();
  }, [memberId, businessId]);

  const checkInDates = checkIns.map(c => new Date(c.check_in_time));
  const holidayDates = holidays.map(h => new Date(h));

  const checkInsExcludingHolidays = checkIns.filter(c => {
    const checkInDate = new Date(c.check_in_time).toISOString().split('T')[0];
    return !holidays.includes(checkInDate);
  });

  const selectedDayCheckIns = checkIns.filter(c => 
    selectedDate && isSameDay(new Date(c.check_in_time), selectedDate)
  );

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const totalCheckIns = checkInsExcludingHolidays.filter(c => c.check_out_time).length;
  const totalDuration = checkInsExcludingHolidays.reduce((sum, c) => sum + (c.duration_minutes || 0), 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const thisMonthCheckIns = checkInsExcludingHolidays.filter(c => {
    const date = new Date(c.check_in_time);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear && c.check_out_time;
  }).length;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const thisWeekCheckIns = checkInsExcludingHolidays.filter(c => {
    const date = new Date(c.check_in_time);
    return date >= startOfWeek && c.check_out_time;
  }).length;

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading check-ins...</div>;
  }

  return (
    <div className="space-y-6 opacity-0 animate-fade-up">
      <div>
        <h2 className="font-display text-2xl font-medium mb-1">Check-in History</h2>
        <p className="text-muted-foreground">Track your gym visits and workout time</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Visits</p>
          <p className="text-2xl font-semibold">{totalCheckIns}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">This Week</p>
          <p className="text-2xl font-semibold">{thisWeekCheckIns}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">This Month</p>
          <p className="text-2xl font-semibold">{thisMonthCheckIns}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Time</p>
          <p className="text-2xl font-semibold">{formatDuration(totalDuration)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="pointer-events-auto"
            modifiers={{
              checkIn: checkInDates,
              holiday: holidayDates,
            }}
            modifiersStyles={{
              checkIn: {
                backgroundColor: 'hsl(var(--success) / 0.2)',
                color: 'hsl(var(--success-foreground))',
                fontWeight: 'bold',
              },
              holiday: {
                backgroundColor: 'hsl(var(--destructive) / 0.1)',
                color: 'hsl(var(--destructive))',
              },
            }}
            modifiersClassNames={{
              selected: 'bg-primary text-primary-foreground',
            }}
          />
          <div className="mt-4 flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success/20"></div>
              <span>Check-in</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/10"></div>
              <span>Holiday</span>
            </div>
          </div>
        </div>

        <div>
          {selectedDate && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
            </div>
          )}

          {selectedDayCheckIns.length > 0 ? (
            <div className="space-y-2">
              {selectedDayCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(checkIn.check_in_time), 'h:mm a')}
                        {checkIn.check_out_time && (
                          <> → {format(new Date(checkIn.check_out_time), 'h:mm a')}</>
                        )}
                      </p>
                    </div>
                    {checkIn.duration_minutes ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDuration(checkIn.duration_minutes)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-success">Active</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
              <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No check-ins on this day</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
