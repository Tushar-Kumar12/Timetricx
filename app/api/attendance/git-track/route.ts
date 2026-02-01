import { NextResponse } from "next/server";
import connectDB from "../../../../lib/database";
import { User } from "../../../../models/User";
import { formatToMonths } from "../../../../utils/formatDate";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    await connectDB();

    const user = await User.findOne({ email });

    if (!user?.authProviders?.github?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "GitHub not linked"
        },
        { status: 400 }
      );
    }

    /* ------------------ GITHUB USERNAME ------------------ */
    const raw = user.authProviders.github.id;
    const username = raw.includes("github.com/")
      ? raw.split("github.com/")[1]
      : raw;

    /* ------------------ ROLLING 12 MONTH RANGE ------------------ */
    const today = new Date();
    const to = today.toISOString();

    const fromDate = new Date();
    fromDate.setFullYear(today.getFullYear() - 1);
    fromDate.setDate(fromDate.getDate() + 1);

    const from = fromDate.toISOString();

    /* ------------------ GRAPHQL QUERY ------------------ */
    const query = `
      query {
        user(login: "${username}") {
          contributionsCollection(
            from: "${from}",
            to: "${to}"
          ) {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;

    const ghRes = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    const ghData = await ghRes.json();

    if (!ghData?.data?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "GitHub API failed",
          error: ghData
        },
        { status: 500 }
      );
    }

    /* ------------------ FORMAT DATA ------------------ */
    const weeks =
      ghData.data.user
        .contributionsCollection
        .contributionCalendar
        .weeks;

    const structured = formatToMonths(weeks);

    /* ------------------ RESPONSE ------------------ */
    return NextResponse.json({
      success: true,
      data: {
        months: structured
      }
    });

  } catch (err) {
    console.error("Git-track error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Server error"
      },
      { status: 500 }
    );
  }
}
