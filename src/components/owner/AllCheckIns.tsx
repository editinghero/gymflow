import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Clock, Users } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { db } from "@/lib/db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Member } from "@/types";

interface CheckIn {
  id: string;
  member_id: string;
  check_in_time: string;
  check_out_time: string | null;
  duration_minutes: number | null;
}

interface AllCheckInsProps {
  businessId: string;
}

export function AllCheckIns({ businessId }: AllCheckInsProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMemberId, setSelectedMemberId] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [checkInsRes, membersRes, holidaysRes]: any = await Promise.all([
        db.from('check_ins').select('*').eq('business_id', businessId).order('check_in_time', { ascending: false }),
        db.from('members').select('*').eq('business_id', businessId),
        db.from('holidays').select('date').eq('business_id', businessId),
      ]);

      if (checkInsRes.data) setCheckIns(checkInsRes.data);
      if (membersRes.data) setMembers(membersRes.data);
      if (holidaysRes.data) setHolidays(holidaysRes.data.map((h: any) => h.date));
      setLoading(false);
    };

    fetchData();
  }, [businessId]);

  const filteredCheckIns = selectedMemberId === "all" 
    ? checkIns 
    : checkIns.filter(c => c.member_id === selectedMemberId);

  const checkInsExcludingHolidays = filteredCheckIns.filter(c => {
    const checkInDate = new Date(c.check_in_time).toISOString().split('T')[0];
    return !holidays.includes(checkInDate);
  });

  const checkInDates = filteredCheckIns.map(c => new Date(c.check_in_time));
  const holidayDates = holidays.map(h => new Date(h));

  const selectedDayCheckIns = filteredCheckIns.filter(c => 
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

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member?.full_name || 'Unknown';
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading check-ins...</div>;
  }

  return (
    <div className="space-y-6 opacity-0 animate-fade-up">
      <div>
        <h2 className="font-display text-2xl font-medium mb-1">All Check-ins</h2>
        <p className="text-muted-foreground">View member check-in history</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Check-ins</p>
            <p className="text-2xl font-semibold">{totalCheckIns}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Time</p>
            <p className="text-2xl font-semibold">{formatDuration(totalDuration)}</p>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Filter by member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {members.map(member => (
                <SelectItem key={member.id} value={member.id}>
                  {member.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {selectedDayCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{getMemberName(checkIn.member_id)}</p>
                    {checkIn.duration_minutes ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDuration(checkIn.duration_minutes)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-success">Active</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(checkIn.check_in_time), 'h:mm a')}
                    {checkIn.check_out_time && (
                      <> → {format(new Date(checkIn.check_out_time), 'h:mm a')}</>
                    )}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
              <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No check-ins on this day</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
