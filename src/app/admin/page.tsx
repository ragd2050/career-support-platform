import { prisma } from "@/lib/prisma";

import {
  AdminOverviewHero,
  AdminOverviewHeaderActions,
  AdminOverviewStats,
  AdminActivityHeading,
  AdminSignupsChart,
} from "@/components/admin/AdminOverviewClient";

export const dynamic = "force-dynamic";

const HERO_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

type WeeklyActivityPoint = {
  date: string;
  count: number;
};

type MonthlyActivityPoint = {
  year: number;
  month: number;
  count: number;
};

async function getOverviewData() {
  const now = new Date();

  /* =====================================================
     DATE RANGES
  ===================================================== */

  const weeklyStart = new Date(now);

  weeklyStart.setDate(
    weeklyStart.getDate() - 6
  );

  weeklyStart.setHours(
    0,
    0,
    0,
    0
  );

  const monthlyStart = new Date(
    now.getFullYear(),
    now.getMonth() - 11,
    1
  );

  monthlyStart.setHours(
    0,
    0,
    0,
    0
  );

  const activeUsersStart =
    new Date(
      Date.now() -
        30 *
          24 *
          60 *
          60 *
          1000
    );

  /* =====================================================
     DATABASE QUERIES
  ===================================================== */

  const [
    totalUsers,
    totalResumes,
    totalVisits,
    activeUsers,

    weeklyUsers,
    weeklyVisits,

    monthlyUsers,
    monthlyVisits,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.resume.count(),

    prisma.platformVisit.count(),

    prisma.user.count({
      where: {
        updatedAt: {
          gte: activeUsersStart,
        },
      },
    }),

    prisma.user.findMany({
      where: {
        createdAt: {
          gte: weeklyStart,
        },
      },
      select: {
        createdAt: true,
      },
    }),

    prisma.platformVisit.findMany({
      where: {
        createdAt: {
          gte: weeklyStart,
        },
      },
      select: {
        createdAt: true,
      },
    }),

    prisma.user.findMany({
      where: {
        createdAt: {
          gte: monthlyStart,
        },
      },
      select: {
        createdAt: true,
      },
    }),

    prisma.platformVisit.findMany({
      where: {
        createdAt: {
          gte: monthlyStart,
        },
      },
      select: {
        createdAt: true,
      },
    }),
  ]);

  /* =====================================================
     WEEKLY SIGNUPS
  ===================================================== */

  const weeklySignups: WeeklyActivityPoint[] =
    [];

  for (
    let i = 6;
    i >= 0;
    i--
  ) {
    const date = new Date(now);

    date.setDate(
      now.getDate() - i
    );

    weeklySignups.push({
      date: date
        .toISOString()
        .slice(0, 10),

      count: 0,
    });
  }

  for (const user of weeklyUsers) {
    const key =
      user.createdAt
        .toISOString()
        .slice(0, 10);

    const day =
      weeklySignups.find(
        (item) =>
          item.date === key
      );

    if (day) {
      day.count += 1;
    }
  }

  /* =====================================================
     WEEKLY VISITS
  ===================================================== */

  const weeklyPlatformVisits: WeeklyActivityPoint[] =
    weeklySignups.map(
      (item) => ({
        date: item.date,
        count: 0,
      })
    );

  for (const visit of weeklyVisits) {
    const key =
      visit.createdAt
        .toISOString()
        .slice(0, 10);

    const day =
      weeklyPlatformVisits.find(
        (item) =>
          item.date === key
      );

    if (day) {
      day.count += 1;
    }
  }

  /* =====================================================
     MONTHLY SIGNUPS
  ===================================================== */

  const monthlySignups: MonthlyActivityPoint[] =
    [];

  for (
    let i = 11;
    i >= 0;
    i--
  ) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    monthlySignups.push({
      year:
        date.getFullYear(),

      month:
        date.getMonth(),

      count: 0,
    });
  }

  for (const user of monthlyUsers) {
    const year =
      user.createdAt.getFullYear();

    const month =
      user.createdAt.getMonth();

    const item =
      monthlySignups.find(
        (entry) =>
          entry.year === year &&
          entry.month === month
      );

    if (item) {
      item.count += 1;
    }
  }

  /* =====================================================
     MONTHLY VISITS
  ===================================================== */

  const monthlyPlatformVisits: MonthlyActivityPoint[] =
    monthlySignups.map(
      (item) => ({
        year: item.year,
        month: item.month,
        count: 0,
      })
    );

  for (const visit of monthlyVisits) {
    const year =
      visit.createdAt.getFullYear();

    const month =
      visit.createdAt.getMonth();

    const item =
      monthlyPlatformVisits.find(
        (entry) =>
          entry.year === year &&
          entry.month === month
      );

    if (item) {
      item.count += 1;
    }
  }

  /* =====================================================
     RETURN
  ===================================================== */

  return {
    stats: {
      totalUsers,
      totalResumes,
      totalVisits,
      activeUsers,
    },

    activity: {
      weekly: {
        signups:
          weeklySignups,

        visits:
          weeklyPlatformVisits,
      },

      monthly: {
        signups:
          monthlySignups,

        visits:
          monthlyPlatformVisits,
      },
    },
  };
}

export default async function AdminOverviewPage() {
  const {
    stats,
    activity,
  } = await getOverviewData();

  /*
   * نخلي HeaderActions يستخدم بيانات التسجيلات الأسبوعية
   * حاليًا حتى لا نكسر الـcomponent الحالي.
   *
   * لاحقًا ممكن نعدله ليستقبل activity كاملة.
   */
  const dailySignups =
    activity.weekly.signups;

  return (
    <div className="flex flex-col gap-5">
      {/* =================================================
          HERO
      ================================================= */}

      <section
        className="relative overflow-hidden rounded-[20px] px-6 py-7 text-white shadow-[0_12px_32px_rgba(0,0,0,0.10),0_4px_8px_rgba(0,0,0,0.05)] sm:px-8 sm:py-8"
        style={{
          backgroundImage: `linear-gradient(130deg, #6A1218 0%, #8B1E24 60%, #A0282E 100%), ${HERO_PATTERN}`,
        }}
      >
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <AdminOverviewHero />

          <AdminOverviewHeaderActions
            stats={stats}
            dailySignups={
              dailySignups
            }
          />
        </div>
      </section>

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <AdminOverviewStats
        stats={stats}
      />

      {/* =================================================
          ACTIVITY
      ================================================= */}

      <section className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-[#201A17] sm:p-6">
        <AdminActivityHeading />

        <AdminSignupsChart
          activity={activity}
        />
      </section>
    </div>
  );
}