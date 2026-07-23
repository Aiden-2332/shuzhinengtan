"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar,
  MapPin,
  Database,
  Bell,
  User,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Leaf,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  LogIn,
  Key,
  Mail,
  Shield,
} from "lucide-react";
import { AllDevices, type AlarmRecord } from "@/data/energy-monitor-data";

interface AppHeaderProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function AppHeader({ sidebarCollapsed = false, onToggleSidebar }: AppHeaderProps) {
  const [year, setYear] = useState("2026");
  const [campus, setCampus] = useState("all");
  const [dataStatus, setDataStatus] = useState("realtime");

  // Alarm dropdown state
  const [showAlarms, setShowAlarms] = useState(false);
  const alarmRef = useRef<HTMLDivElement>(null);

  // User login panel state
  const [showLogin, setShowLogin] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);
  const [loginAccount, setLoginAccount] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: "校领导", role: "管理员" });

  // Collect all alarm records from devices
  const allAlarms = useMemo(() => {
    const alarms: (AlarmRecord & { deviceName: string; deviceId: string })[] = [];
    AllDevices.forEach((d) => {
      d.alarmHistory.forEach((a) => {
        alarms.push({ ...a, deviceName: d.name, deviceId: d.id });
      });
    });
    // Sort by time descending
    alarms.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return alarms;
  }, []);

  const unreadCount = allAlarms.filter((a) => a.status === "pending").length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (alarmRef.current && !alarmRef.current.contains(e.target as Node)) {
        setShowAlarms(false);
      }
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setShowLogin(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = () => {
    if (!loginAccount.trim()) {
      setLoginError("请输入账号");
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError("请输入密码");
      return;
    }
    // Demo login logic
    if (loginAccount === "admin" && loginPassword === "admin123") {
      setIsLoggedIn(true);
      setCurrentUser({ name: "校领导", role: "管理员" });
      setShowLogin(false);
      setLoginError("");
      setLoginAccount("");
      setLoginPassword("");
    } else if (loginAccount === "energy" && loginPassword === "energy123") {
      setIsLoggedIn(true);
      setCurrentUser({ name: "赵能源", role: "后勤能源管理员" });
      setShowLogin(false);
      setLoginError("");
      setLoginAccount("");
      setLoginPassword("");
    } else if (loginAccount === "carbon" && loginPassword === "carbon123") {
      setIsLoggedIn(true);
      setCurrentUser({ name: "钱碳管", role: "碳管理员" });
      setShowLogin(false);
      setLoginError("");
      setLoginAccount("");
      setLoginPassword("");
    } else {
      setLoginError("账号或密码错误");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser({ name: "校领导", role: "管理员" });
  };

  const alarmTypeIcon = (type: AlarmRecord["type"]) => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const alarmTypeLabel = (type: AlarmRecord["type"]) => {
    switch (type) {
      case "danger":
        return "危险";
      case "warning":
        return "警告";
      case "info":
        return "信息";
    }
  };

  const alarmStatusLabel = (status: AlarmRecord["status"]) => {
    switch (status) {
      case "pending":
        return { text: "待处理", color: "text-red-400 bg-red-500/10" };
      case "processing":
        return { text: "处理中", color: "text-amber-400 bg-amber-500/10" };
      case "closed":
        return { text: "已关闭", color: "text-gray-400 bg-gray-500/10" };
    }
  };

  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur-xl border-b border-cyan-500/20 flex items-center justify-between px-6 relative z-50">
      {/* Left: Platform Name + Toggle + Filters */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-gray-400 hover:text-cyan-400"
          title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        {/* Platform Name */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">高校智慧碳管理</h1>
            <p className="text-[10px] text-cyan-400 leading-tight">Smart Carbon Platform</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-700/50" />

        {/* Year Filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-cyan-500/20">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="bg-transparent text-sm text-gray-300 outline-none cursor-pointer"
          >
            <option value="2026">2026 年度</option>
            <option value="2025">2025 年度</option>
            <option value="2024">2024 年度</option>
          </select>
        </div>

        {/* Campus Filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-cyan-500/20">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <select
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            className="bg-transparent text-sm text-gray-300 outline-none cursor-pointer"
          >
            <option value="all">全校</option>
            <option value="main">主校区</option>
            <option value="east">东校区</option>
          </select>
        </div>

        {/* Data Status Filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-cyan-500/20">
          <Database className="w-4 h-4 text-cyan-400" />
          <select
            value={dataStatus}
            onChange={(e) => setDataStatus(e.target.value)}
            className="bg-transparent text-sm text-gray-300 outline-none cursor-pointer"
          >
            <option value="realtime">实时估算</option>
            <option value="monthly">月度锁定</option>
            <option value="yearly">年度确认</option>
          </select>
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-4">
        {/* Notifications - Alarm Center */}
        <div className="relative" ref={alarmRef}>
          <button
            onClick={() => {
              setShowAlarms(!showAlarms);
              setShowLogin(false);
            }}
            className="relative p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            title="告警中心"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Alarm Dropdown */}
          {showAlarms && (
            <div className="absolute right-0 top-full mt-2 w-[420px] bg-slate-900 border border-cyan-500/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">告警中心</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                    {allAlarms.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowAlarms(false)}
                  className="p-1 rounded hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Alarm List */}
              <div className="max-h-[360px] overflow-y-auto">
                {allAlarms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-500/50" />
                    <span className="text-sm">暂无告警</span>
                  </div>
                ) : (
                  allAlarms.slice(0, 20).map((alarm, idx) => (
                    <div
                      key={`${alarm.deviceId}-${idx}`}
                      className="px-4 py-3 border-b border-gray-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">{alarmTypeIcon(alarm.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                alarm.type === "danger"
                                  ? "text-red-400 bg-red-500/10"
                                  : alarm.type === "warning"
                                    ? "text-amber-400 bg-amber-500/10"
                                    : "text-blue-400 bg-blue-500/10"
                              }`}
                            >
                              {alarmTypeLabel(alarm.type)}
                            </span>
                            <span className="text-xs text-gray-500 truncate">{alarm.deviceName}</span>
                          </div>
                          <p className="text-sm text-gray-300 leading-snug mb-1.5">{alarm.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {alarm.time}
                            </div>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded ${alarmStatusLabel(alarm.status).color}`}
                            >
                              {alarmStatusLabel(alarm.status).text}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {allAlarms.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    共 {allAlarms.length} 条告警，{unreadCount} 条待处理
                  </span>
                  <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                    查看全部 →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile / Login */}
        <div className="relative" ref={loginRef}>
          <button
            onClick={() => {
              setShowLogin(!showLogin);
              setShowAlarms(false);
            }}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <div className="text-gray-300 font-medium">{currentUser.name}</div>
              <div className="text-xs text-gray-500">{currentUser.role}</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showLogin ? "rotate-180" : ""}`} />
          </button>

          {/* Login Panel */}
          {showLogin && (
            <div className="absolute right-0 top-full mt-2 w-[320px] bg-slate-900 border border-cyan-500/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
              {isLoggedIn ? (
                /* Logged-in state */
                <>
                  <div className="px-5 py-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{currentUser.name}</div>
                        <div className="text-xs text-gray-400">{currentUser.role}</div>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-3 border-b border-gray-800">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <Shield className="w-3.5 h-3.5" />
                      <span>权限范围：全校碳排放数据</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>上次登录：2026-07-21 08:30</span>
                    </div>
                  </div>
                  <div className="px-5 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      退出登录
                    </button>
                  </div>
                </>
              ) : (
                /* Login form */
                <>
                  <div className="px-5 py-4 border-b border-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <LogIn className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-semibold text-white">账号登录</span>
                    </div>
                    <p className="text-xs text-gray-500">请使用您的账号登录系统</p>
                  </div>

                  <div className="px-5 py-4 space-y-3">
                    {/* Account */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">账号</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          value={loginAccount}
                          onChange={(e) => {
                            setLoginAccount(e.target.value);
                            setLoginError("");
                          }}
                          placeholder="请输入账号"
                          className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500/50 transition-colors"
                          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">密码</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            setLoginError("");
                          }}
                          placeholder="请输入密码"
                          className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500/50 transition-colors"
                          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        />
                      </div>
                    </div>

                    {/* Error */}
                    {loginError && (
                      <div className="flex items-center gap-1.5 text-xs text-red-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {loginError}
                      </div>
                    )}

                    {/* Login Button */}
                    <button
                      onClick={handleLogin}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all"
                    >
                      登 录
                    </button>

                    {/* Demo accounts hint */}
                    <div className="pt-2 border-t border-gray-800">
                      <p className="text-[10px] text-gray-600 mb-1.5">演示账号：</p>
                      <div className="space-y-1 text-[10px] text-gray-500">
                        <div className="flex justify-between">
                          <span>校领导：</span>
                          <span className="text-gray-400 font-mono">admin / admin123</span>
                        </div>
                        <div className="flex justify-between">
                          <span>能源管理员：</span>
                          <span className="text-gray-400 font-mono">energy / energy123</span>
                        </div>
                        <div className="flex justify-between">
                          <span>碳管理员：</span>
                          <span className="text-gray-400 font-mono">carbon / carbon123</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
