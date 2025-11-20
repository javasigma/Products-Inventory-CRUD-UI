import React from "react"


export function StatsSection() {
  const stats = [
    { number: "100+", label: "Active Users" },
    { number: "99%", label: "Uptime" },
    { number: "5M+", label: "Items Tracked" },
    { number: "24/7", label: "Support" },
  ]

  return (
    <section className="py-16 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
              <div className="text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
