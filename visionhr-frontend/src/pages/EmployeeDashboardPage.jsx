import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  LogOut,
  Clock,
  Calendar,
  Thermometer,
  Award,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../features/auth/authApi.js';
import { attendanceApi } from '../features/attendance/attendanceApi.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Spinner from '../components/common/Spinner.jsx';
import DataTable from '../components/common/DataTable.jsx';
import { formatDate, formatTime, isSameCalendarDay } from '../utils/date.js';

export default function EmployeeDashboardPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const meQuery = useQuery({ queryKey: ['me'], queryFn: authApi.me });
  const attendanceQuery = useQuery({
    queryKey: ['attendance', 'my'],
    queryFn: () => attendanceApi.my({ limit: 5 }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['attendance', 'my'] });
  };

  const punchInMutation = useMutation({
    mutationFn: attendanceApi.punchIn,
    onSuccess: (data) => {
      toast.success(data.message || 'Punched in successfully.');
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not punch in.'),
  });

  const punchOutMutation = useMutation({
    mutationFn: attendanceApi.punchOut,
    onSuccess: () => {
      toast.success('Punched out. Have a great rest of your day.');
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not punch out.'),
  });

  const records = attendanceQuery.data?.data || [];
  const todayRecord = records.find((r) => isSameCalendarDay(r.date, new Date()));
  const hasPunchedIn = Boolean(todayRecord?.punchIn?.timestamp);
  const hasPunchedOut = Boolean(todayRecord?.punchOut?.timestamp);
  const leaveBalances = meQuery.data?.employee?.leaveBalances;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      {/* Hero Header */}
      <div className="animate-slide-up mb-8 rounded-2xl gradient-mesh border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {greeting()}, {user?.fullName?.split(' ')[0] || 'there'}.
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {formatDate(new Date())} — Here's what's happening today.
        </p>
      </div>

      <div className="stagger-children grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Attendance Widget */}
        <div className="lg:col-span-1">
          <Card className="h-full overflow-hidden p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-ink-soft font-medium">
                  <Clock className="h-4 w-4" />
                  Time Clock
                </div>
                {todayRecord?.status && (
                  <Badge tone={todayRecord.status}>{todayRecord.status}</Badge>
                )}
              </div>

              <div className="flex-1 text-center py-6">
                <div className="text-4xl font-bold tracking-tight text-ink mb-1 font-mono">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-sm text-ink-faint">Current Time</div>

                {todayRecord && (
                  <div className="mt-6 flex justify-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-ink">
                        {formatTime(todayRecord.punchIn?.timestamp)}
                      </div>
                      <div className="text-xs text-ink-faint mt-0.5">Punched In</div>
                    </div>
                    <div className="w-px bg-line"></div>
                    <div className="text-center">
                      <div className="font-medium text-ink">
                        {formatTime(todayRecord.punchOut?.timestamp)}
                      </div>
                      <div className="text-xs text-ink-faint mt-0.5">Punched Out</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto">
                {!hasPunchedIn ? (
                  <Button
                    onClick={() => punchInMutation.mutate()}
                    loading={punchInMutation.isPending}
                    className="w-full h-12 text-base shadow-lg shadow-primary-500/20"
                  >
                    <LogIn className="h-5 w-5" /> Punch In
                  </Button>
                ) : !hasPunchedOut ? (
                  <Button
                    onClick={() => punchOutMutation.mutate()}
                    loading={punchOutMutation.isPending}
                    variant="outline"
                    className="w-full h-12 text-base border-primary-200 text-primary-700 hover:bg-primary-50"
                  >
                    <LogOut className="h-5 w-5" /> Punch Out
                  </Button>
                ) : (
                  <div className="rounded-lg bg-canvas py-3 text-center text-sm text-ink-soft">
                    Attendance complete for today.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Balances & Quick Links */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Leave Balances */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-faint">
              Leave Balances
            </h2>
            {meQuery.isLoading ? (
              <Card className="p-8"><Spinner className="justify-center" /></Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <BalanceCard
                  title="Casual Leave"
                  value={leaveBalances?.casual}
                  icon={Calendar}
                  tone="primary"
                />
                <BalanceCard
                  title="Sick Leave"
                  value={leaveBalances?.sick}
                  icon={Thermometer}
                  tone="rose"
                />
                <BalanceCard
                  title="Earned Leave"
                  value={leaveBalances?.earned}
                  icon={Award}
                  tone="amber"
                />
              </div>
            )}
          </div>

          {/* Recent Attendance */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
                Recent Attendance
              </h2>
            </div>
            
            <DataTable
              isLoading={attendanceQuery.isLoading}
              data={records.slice(0, 5)}
              emptyTitle="No attendance records"
              emptyDescription="Punch in to start recording your attendance."
              columns={[
                { header: 'Date', render: (r) => <span className="font-medium text-ink">{formatDate(r.date)}</span> },
                { header: 'In', accessor: 'punchIn.timestamp', render: (r) => formatTime(r.punchIn?.timestamp) },
                { header: 'Out', accessor: 'punchOut.timestamp', render: (r) => formatTime(r.punchOut?.timestamp) },
                { header: 'Hours', render: (r) => r.totalHours || '—' },
                { header: 'Status', render: (r) => <Badge tone={r.status}>{r.status}</Badge> },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceCard({ title, value, icon: Icon, tone }) {
  const tones = {
    primary: 'text-primary-600 stat-accent-green',
    rose: 'text-rose-600 stat-accent-rose',
    amber: 'text-amber-600 stat-accent-amber',
  };

  return (
    <Card className="card-hover relative overflow-hidden p-5">
      <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full ${tones[tone]} opacity-50 blur-2xl`}></div>
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-lg bg-canvas p-2">
            <Icon className="h-4 w-4 text-ink-soft" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-ink">{value ?? '—'}</p>
          <p className="mt-1 text-sm font-medium text-ink-soft">{title}</p>
        </div>
      </div>
    </Card>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
