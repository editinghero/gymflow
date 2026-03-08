import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Clock, X } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { db } from "@/lib/db";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Member } from "@/types";

interface CheckIn {
  id: string;
  check_in_time: string;
  check_out_time: string | null;
  duration_minutes: number | null;
}

interface MemberCheckInsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member;
  businessId: string;
}

export function MemberCheckIns({ open, onOpenChange, member, businessId }: MemberCheckInsProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, member.id]);

  const fetchData = async () => {
    setLoading(true);
    const [checkInsRes, holidaysRes]: any = await Promise.all([
      db.from('check_ins').select('*').eq('member_id', member.id).order('check_in_time', { ascending: false }),
      db.from('holidays').select('date').eq('business_id', businessId),
    ]);

    if (checkInsRes.data) setCheckIns(checkInsRes.data);
    if (holidaysRes.data) setHolidays(holidaysRes.data.map((h: any) => h.date));
    setLoading(false);
  };

  const checkInDates = checkIns.map(c => new Date(c.check_in_time));
  const holidayDates = holidays.map(h => new Date(h));

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

  const totalCheckIns = checkIns.filter(c => c.check_out_time).length;
  const totalDuration = checkIns.reduce((sum, c) => sum + (c.duration_minutes || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {member.full_name}'s Check-in History
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {totalCheckIns} total visits • {formatDuration(totalDuration)} total time
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
                    <h3 className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
