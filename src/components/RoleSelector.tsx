import { Building2, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { UserRole } from "@/types";

const roles = [
  {
    id: 'owner' as UserRole,
    title: 'Business Owner',
    description: 'Manage your gym, plans, and members',
    icon: Building2,
    color: 'primary',
  },
  {
    id: 'customer' as UserRole,
    title: 'Member',
    description: 'View plans and manage your membership',
    icon: Dumbbell,
    color: 'info',
  },
];

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSelectRole = (role: UserRole) => {
    localStorage.setItem('selected_role', role);
    onSelectRole(role);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-lg space-y-6 sm:space-y-8 opacity-0 animate-fade-up">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-foreground italic">
            {getTimeGreeting()}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            How would you like to continue?
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4 mt-8 sm:mt-12">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                className={cn(
                  "w-full group relative overflow-hidden rounded-xl sm:rounded-2xl border bg-card p-4 sm:p-6",
                  "transition-all duration-300 hover:shadow-large hover:-translate-y-1",
                  "text-left opacity-0 animate-fade-up",
                  index === 0 && "stagger-1",
                  index === 1 && "stagger-2",
                )}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={cn(
                    "flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                    role.color === 'primary' && "bg-primary/10 text-primary",
                    role.color === 'info' && "bg-info/10 text-info",
                  )}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg sm:text-xl font-medium text-foreground group-hover:text-primary transition-colors">
                      {role.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                      {role.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
