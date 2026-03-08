import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { 
  Plus, 
  Trash2,
  CalendarIcon,
  Clock
} from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { Schedule, Holiday } from "@/types";

interface ScheduleManagerProps {
  businessId: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ScheduleManager({ businessId }: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isAddingSlot, setIsAddingSlot] = useState<number | null>(null);
  const [newSlot, setNewSlot] = useState({ start_time: '09:00', end_time: '18:00' });
  const [newHoliday, setNewHoliday] = useState({ 
    date: '', 
    reason: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [schedulesRes, holidaysRes] = await Promise.all([
      db.from('schedules').select('*').eq('business_id', businessId).order('day_of_week').then((res: any) => res),
      db.from('holidays').select('*').eq('business_id', businessId).order('date').then((res: any) => res),
    ]);

    if (schedulesRes.data) setSchedules(schedulesRes.data);
    if (holidaysRes.data) setHolidays(holidaysRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [businessId]);

  const getSchedulesForDay = (dayOfWeek: number) => {
    return schedules.filter(s => s.day_of_week === dayOfWeek).sort((a, b) => 
      a.start_time.localeCompare(b.start_time)
    );
  };

  const handleAddSlot = async (dayOfWeek: number) => {
    const { error } = await db.from('schedules').insert({
      business_id: businessId,
      day_of_week: dayOfWeek,
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
      is_open: true,
    }).then((res: any) => res);

    if (error) {
      toast.error('Failed to add time slot');
      console.error(error);
    } else {
      toast.success('Time slot added');
      setIsAddingSlot(null);
      setNewSlot({ start_time: '09:00', end_time: '18:00' });
      fetchData();
    }
  };

  const handleDeleteSlot = async (id: string) => {
    const { error } = await db.from('schedules').delete().eq('id', id).then((res: any) => res);
    if (error) {
      toast.error('Failed to delete time slot');
    } else {
      toast.success('Time slot removed');
      fetchData();
    }
  };

  const handleToggleSlot = async (id: string, isOpen: boolean) => {
    const { error } = await db.from('schedules').update({ is_open: isOpen }).eq('id', id).then((res: any) => res);
    if (error) {
      toast.error('Failed to update slot');
    } else {
      fetchData();
    }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.date) {
      toast.error('Please select a date');
      return;
    }

    const { error } = await db.from('holidays').insert({
      business_id: businessId,
      date: newHoliday.date,
      reason: newHoliday.reason || 'Holiday',
    }).then((res: any) => res);

    if (error) {
      toast.error('Failed to add holiday');
    } else {
      toast.success('Holiday added');
      setNewHoliday({ date: '', reason: '' });
      setIsHolidayDialogOpen(false);
      fetchData();
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    const { error } = await db.from('holidays').delete().eq('id', id).then((res: any) => res);
    if (error) {
      toast.error('Failed to delete holiday');
    } else {
      toast.success('Holiday removed');
      fetchData();
    }
  };
  const holidayDates = holidays.map(h => new Date(h.date));

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading schedule...</div>;
  }

  return (
    <div className="space-y-8 opacity-0 animate-fade-up">
      {}
      <div>
        <h2 className="font-display text-2xl font-medium mb-1">Working Hours</h2>
        <p className="text-muted-foreground mb-6">Set multiple time slots per day</p>

        <div className="space-y-4">
          {DAYS.map((day, dayIndex) => {
            const daySchedules = getSchedulesForDay(dayIndex);
            return (
              <div
                key={dayIndex}
                className="rounded-xl border bg-card p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{day}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingSlot(isAddingSlot === dayIndex ? null : dayIndex)}
                    className="text-primary"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add slot
                  </Button>
                </div>

                {}
                <div className="space-y-2">
                  {daySchedules.map((slot) => (
                    <div
                      key={slot.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg bg-muted/50",
                        !slot.is_open && "opacity-50"
                      )}
                    >
                      <Switch
                        checked={slot.is_open}
                        onCheckedChange={(checked) => handleToggleSlot(slot.id, checked)}
                      />
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {slot.start_time} – {slot.end_time}
                      </span>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="ml-auto p-1 hover:bg-destructive/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ))}

                  {daySchedules.length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">No time slots – Closed</p>
                  )}
                </div>

                {}
                {isAddingSlot === dayIndex && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Input
                      type="time"
                      value={newSlot.start_time}
                      onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                      className="w-28 rounded-lg"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={newSlot.end_time}
                      onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                      className="w-28 rounded-lg"
                    />
                    <Button size="sm" onClick={() => handleAddSlot(dayIndex)} className="rounded-lg">
                      Add
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setIsAddingSlot(null)}
                      className="rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-medium mb-1">Holidays</h2>
            <p className="text-muted-foreground">Schedule closures and special dates</p>
          </div>

          <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Holiday
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Add Holiday</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start rounded-xl">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {newHoliday.date ? format(new Date(newHoliday.date), 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newHoliday.date ? new Date(newHoliday.date) : undefined}
                        onSelect={(date) => date && setNewHoliday({ ...newHoliday, date: date.toISOString().split('T')[0] })}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (optional)</Label>
                  <Input
                    id="reason"
                    value={newHoliday.reason}
                    onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })}
                    placeholder="New Year's Day"
                    className="rounded-xl"
                  />
                </div>
                <Button onClick={handleAddHoliday} className="w-full rounded-xl">
                  Add Holiday
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {}
          <div className="rounded-xl border bg-card p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="pointer-events-auto"
              modifiers={{
                holiday: holidayDates,
              }}
              modifiersStyles={{
                holiday: {
                  backgroundColor: 'hsl(var(--destructive) / 0.2)',
                  borderRadius: '50%',
                  color: 'hsl(var(--destructive))',
                },
              }}
            />
          </div>

          {}
          <div>
            {holidays.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center h-full flex flex-col items-center justify-center">
                <CalendarIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No holidays scheduled</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {holidays
                  .filter(h => new Date(h.date) >= new Date())
                  .slice(0, 10)
                  .map((holiday) => (
                    <div
                      key={holiday.id}
                      className="flex items-center justify-between rounded-xl border bg-card p-4"
                    >
                      <div>
                        <p className="font-medium">{holiday.reason || 'Holiday'}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(holiday.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteHoliday(holiday.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ))}
                {holidays.filter(h => new Date(h.date) >= new Date()).length > 10 && (
                  <p className="text-center text-sm text-muted-foreground py-2">
                    +{holidays.filter(h => new Date(h.date) >= new Date()).length - 10} more holidays
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

