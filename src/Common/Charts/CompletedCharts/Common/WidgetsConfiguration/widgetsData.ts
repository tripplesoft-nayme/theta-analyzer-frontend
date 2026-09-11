export const widgetsData = [
  {
    "id": "sample-bar-chart",
    "name": "Bar Chart",
    "primaryDataType": "Category + Numeric",
    "bestUsedFor": "Comparing values across categories",
    "description": "Uses horizontal or vertical bars to compare values across categories.",
    "useCases": ["Sales by region", "Product performance", "Survey results"],
    "dataAccepted": ["Categories (text)", "Numerical values"],
    "processes": "Compares magnitudes across categories."
  },
  {
    "id": "stacked-bar-chart",
    "name": "Theta Stacked Bar Chart",
    "primaryDataType": "Category + Subcategory + Numeric",
    "bestUsedFor": "Composition and contribution analysis",
    "description": "A stacked bar chart showing category totals and their composition.",
    "useCases": ["Revenue breakdown by product", "Department expense analysis", "Market share comparison"],
    "dataAccepted": ["Categories", "Subcategories", "Numerical values"],
    "processes": "Aggregates totals while displaying component contributions."
  },
  {
    "id": "horizontal-bar-chart",
    "name": "Horizontal Bar Chart",
    "primaryDataType": "Category + Subcategory + Numeric",
    "bestUsedFor": "Comparing compositions with many categories or long labels",
    "description": "A horizontally oriented stacked bar chart.",
    "useCases": ["Survey response analysis", "Long category names", "Workforce distribution"],
    "dataAccepted": ["Categories", "Subcategories", "Numerical values"],
    "processes": "Displays proportional contributions across categories."
  },
  {
    "id": "horizontal-stacked-bar-chart",
    "name": "Horizontal Stacked Bar Chart",
    "primaryDataType": "Category + Subcategory + Numeric",
    "bestUsedFor": "Comparing compositions with many categories or long labels",
    "description": "A horizontally oriented stacked bar chart.",
    "useCases": ["Survey response analysis", "Long category names", "Workforce distribution"],
    "dataAccepted": ["Categories", "Subcategories", "Numerical values"],
    "processes": "Displays proportional contributions across categories."
  },
  {
    "id": "column-chart",
    "name": "Theta Column Chart",
    "primaryDataType": "Category + Numeric",
    "bestUsedFor": "Comparing values across categories using vertical columns",
    "description": "A vertical bar chart for category comparison.",
    "useCases": ["Monthly sales", "Revenue by department", "Production output"],
    "dataAccepted": ["Categories", "Numerical values"],
    "processes": "Compares values using vertical columns."
  },
  {
    "id": "line-chart",
    "name": "Theta Line Chart",
    "primaryDataType": "Time-Series + Numeric",
    "bestUsedFor": "Trend analysis over time",
    "description": "A line chart showing trends over time.",
    "useCases": ["Sales trends", "Website traffic", "KPI monitoring"],
    "dataAccepted": ["Time/date values", "Numerical measures"],
    "processes": "Tracks changes and trends over time."
  },
  {
    "id": "multi-axis-line-chart",
    "name": "Multiaxis Line Chart",
    "primaryDataType": "Time-Series + Multiple Numeric Measures",
    "bestUsedFor": "Comparing metrics with different scales",
    "description": "A line chart with multiple Y-axes for different metrics.",
    "useCases": ["Revenue vs Profit comparison", "Temperature vs Humidity", "Cost vs Production output"],
    "dataAccepted": ["Time-series data", "Multiple numerical measures"],
    "processes": "Compares metrics with different scales."
  },
  {
    "id": "sparklines-chart",
    "name": "Sparkline Chart",
    "primaryDataType": "Time-Series",
    "bestUsedFor": "Compact trend visualization in dashboards",
    "description": "A small, compact line chart that shows trends over time.",
    "useCases": ["Dashboard KPIs", "Sales trends", "Website traffic monitoring", "Financial performance tracking"],
    "dataAccepted": ["Time-series numerical data"],
    "processes": "Displays trend direction, peaks, and dips without detailed axes."
  },
  {
    "id": "area-chart",
    "name": "Theta Area Chart",
    "primaryDataType": "Time-Series + Numeric",
    "bestUsedFor": "Trend and volume analysis",
    "description": "A line chart with filled areas underneath.",
    "useCases": ["Revenue growth", "Resource utilization", "Traffic volume trends"],
    "dataAccepted": ["Time-series data", "Numerical values"],
    "processes": "Shows magnitude and trend simultaneously."
  },
  {
    "id": "spline-area-chart",
    "name": "Spline Area Chart",
    "primaryDataType": "Time-Series + Numeric",
    "bestUsedFor": "Smooth trend visualization with volume emphasis",
    "description": "An area chart with smooth curved lines.",
    "useCases": ["Growth trends", "Financial forecasting", "Traffic monitoring"],
    "dataAccepted": ["Time-series data", "Numerical values"],
    "processes": "Displays trends with smoothed transitions."
  },
  {
    "id": "pie-chart",
    "name": "Pie Chart",
    "primaryDataType": "Category + Numeric",
    "bestUsedFor": "Percentage and share-of-total analysis",
    "description": "Displays proportions as slices of a circle.",
    "useCases": ["Budget allocation", "Market share", "Expense distribution"],
    "dataAccepted": ["Categories", "Numerical values"],
    "processes": "Calculates percentage contribution to total."
  },
  {
    "id": "marimekko-chart",
    "name": "Marimekko Chart",
    "primaryDataType": "Category + Subcategory + Numeric",
    "bestUsedFor": "Market share and portfolio composition analysis",
    "description": "A two-dimensional chart that combines a stacked bar chart with variable-width columns.",
    "useCases": ["Market share analysis", "Product portfolio comparison", "Revenue distribution by category and subcategory", "Competitive analysis"],
    "dataAccepted": ["Categories (X-axis)", "Subcategories (stacked segments)", "Numerical values for width and height"],
    "processes": "Compares proportions across multiple dimensions simultaneously."
  },
  {
    "id": "bubble-chart",
    "name": "Bubble Chart",
    "primaryDataType": "Three Numerical Variables",
    "bestUsedFor": "Multivariable relationship analysis",
    "description": "An extension of a scatter plot where bubble size represents a third variable.",
    "useCases": ["Market analysis", "Portfolio management", "Risk-return analysis", "Customer segmentation"],
    "dataAccepted": ["X-axis value", "Y-axis value", "Bubble size value"],
    "processes": "Compares relationships among three quantitative variables."
  },
  {
    "id": "scatter-chart",
    "name": "Scatter Chart",
    "primaryDataType": "Two Numerical Variables",
    "bestUsedFor": "Correlation and outlier analysis",
    "description": "A chart displaying relationships between two numerical variables.",
    "useCases": ["Correlation analysis", "Outlier detection", "Predictive modeling", "Quality control"],
    "dataAccepted": ["X-axis numerical values", "Y-axis numerical values"],
    "processes": "Identifies trends, clusters, and correlations."
  },
  {
    "id": "heat-map-chart",
    "name": "Heatmap Chart",
    "primaryDataType": "Matrix/Category + Numeric",
    "bestUsedFor": "Pattern recognition and intensity analysis",
    "description": "Uses color intensity to represent values.",
    "useCases": ["Website click analysis", "Employee productivity", "Sales performance"],
    "dataAccepted": ["Categories or coordinates", "Numerical values"],
    "processes": "Converts values into color gradients."
  },
  {
    "id": "calendar-heatmap-chart",
    "name": "Calendar Heatmap Chart",
    "primaryDataType": "Date + Numeric",
    "bestUsedFor": "Daily activity or performance tracking",
    "description": "Shows activity levels by day using a calendar layout.",
    "useCases": ["Attendance tracking", "GitHub contributions", "Daily sales activity"],
    "dataAccepted": ["Date", "Numerical values"],
    "processes": "Maps activity intensity to calendar dates."
  },
  {
    "id": "geographic-map",
    "name": "Geographic Map",
    "primaryDataType": "Geographic Location + Numeric",
    "bestUsedFor": "Regional and spatial analysis",
    "description": "Displays data geographically.",
    "useCases": ["Sales by region", "Disease outbreaks", "Logistics tracking"],
    "dataAccepted": ["Geographic locations", "Coordinates", "Numerical metrics"],
    "processes": "Associates metrics with physical locations."
  },
  {
    "id": "histogram-chart",
    "name": "Histogram",
    "primaryDataType": "Continuous Numeric Data",
    "bestUsedFor": "Frequency distribution analysis",
    "description": "Shows frequency distribution of continuous data.",
    "useCases": ["Quality control", "Exam score analysis", "Customer age distribution"],
    "dataAccepted": ["Continuous numerical values"],
    "processes": "Groups data into bins and counts frequencies."
  },
  {
    "id": "pareto-chart",
    "name": "Pareto Chart",
    "primaryDataType": "Category + Frequency/Impact",
    "bestUsedFor": "Root cause and 80/20 analysis",
    "description": "A combination of a bar chart and cumulative percentage line based on the 80/20 principle.",
    "useCases": ["Root cause analysis", "Defect analysis", "Customer complaint categorization", "Process improvement"],
    "dataAccepted": ["Categories", "Frequency or impact values"],
    "processes": "Sorts categories from highest to lowest contribution.\nCalculates cumulative percentages."
  },
  {
    "id": "treemap-chart",
    "name": "Treemap Chart",
    "primaryDataType": "Hierarchical + Numeric",
    "bestUsedFor": "Portfolio and hierarchical distribution analysis",
    "description": "A hierarchical chart using nested rectangles whose sizes represent values.",
    "useCases": ["Investment portfolio visualization", "Budget allocation analysis", "Product category performance", "File storage analysis"],
    "dataAccepted": ["Hierarchical categories", "Numerical values"],
    "processes": "Allocates area size proportional to values while preserving hierarchy."
  },
  {
    "id": "waterfall-chart",
    "name": "Waterfall Chart",
    "primaryDataType": "Sequential Numeric Changes",
    "bestUsedFor": "Variance and contribution analysis",
    "description": "A chart showing how positive and negative values contribute to a final total.",
    "useCases": ["Profit and loss analysis", "Budget variance reporting", "Revenue bridge analysis", "Financial forecasting"],
    "dataAccepted": ["Starting value", "Incremental increases/decreases", "Ending value"],
    "processes": "Sequentially adds or subtracts values to show cumulative impact."
  },
  {
    "id": "funnel-chart",
    "name": "Funnel Chart",
    "primaryDataType": "Sequential Stage Data",
    "bestUsedFor": "Conversion and drop-off analysis",
    "description": "A chart showing the reduction of values through sequential stages.",
    "useCases": ["Sales pipeline analysis", "Lead conversion tracking", "Recruitment process monitoring", "Customer journey analysis"],
    "dataAccepted": ["Ordered stages", "Numeric values at each stage"],
    "processes": "Visualizes drop-off rates between stages."
  },
  {
    "id": "gauge-chart",
    "name": "Gauge Chart",
    "primaryDataType": "Single KPI + Target Range",
    "bestUsedFor": "Performance against targets",
    "description": "A speedometer-style chart displaying performance against a target range.",
    "useCases": ["KPI tracking", "Customer satisfaction scores", "Sales target monitoring", "Operational metrics"],
    "dataAccepted": ["Single metric value", "Target ranges or thresholds"],
    "processes": "Maps a value onto a predefined scale."
  },
  {
    "id": "progress-ring",
    "name": "Progress Ring",
    "primaryDataType": "Percentage/Progress Value",
    "bestUsedFor": "Goal completion tracking",
    "description": "A circular chart showing completion progress toward a target.",
    "useCases": ["Project completion tracking", "Fitness goals", "Task completion rates", "KPI achievement monitoring"],
    "dataAccepted": ["Current value", "Target value or percentage"],
    "processes": "Converts progress into a percentage and visualizes completion."
  },
  {
    "id": "rag-chart",
    "name": "RAG Chart",
    "primaryDataType": "KPI + Thresholds",
    "bestUsedFor": "Status and health monitoring",
    "description": "A status visualization using traffic-light colors.",
    "useCases": ["KPI monitoring", "Risk management", "Project health reporting", "SLA compliance tracking"],
    "dataAccepted": ["Performance metrics", "Threshold values"],
    "processes": "Categorizes performance into: Green = On Target, Amber = Warning, Red = Critical"
  },
  {
    "id": "bullet-chart",
    "name": "Bullet Chart",
    "primaryDataType": "KPI + Target + Benchmark",
    "bestUsedFor": "Target achievement analysis",
    "description": "Compares performance against targets and benchmarks.",
    "useCases": ["KPI dashboards", "Sales targets", "Budget monitoring"],
    "dataAccepted": ["Actual value", "Target value", "Performance ranges"],
    "processes": "Evaluates progress against goals."
  },
  {
    "id": "kpi",
    "name": "KPI Dashboard",
    "primaryDataType": "Multiple KPIs",
    "bestUsedFor": "Executive and operational monitoring",
    "description": "A collection of key performance indicators.",
    "useCases": ["Executive reporting", "Business monitoring", "Operational management"],
    "dataAccepted": ["Multiple KPIs", "Targets", "Historical metrics"],
    "processes": "Consolidates performance metrics into one view."
  },
  {
    "id": "decomposition-tree",
    "name": "Sales Decomposition",
    "primaryDataType": "Measure + Multiple Dimensions",
    "bestUsedFor": "Root-cause and driver analysis",
    "description": "Breaks down a sales metric into contributing factors.",
    "useCases": ["Revenue analysis", "Root-cause investigation", "Business intelligence"],
    "dataAccepted": ["Sales values", "Dimensions (region, product, customer)"],
    "processes": "Identifies drivers of performance."
  },
  {
    "id": "ribbon-chart",
    "name": "Sales Rank Ribbon",
    "primaryDataType": "Ranking Data Over Time",
    "bestUsedFor": "Rank movement and competitive analysis",
    "description": "Tracks ranking changes over time using flowing ribbons.",
    "useCases": ["Product rankings", "Market position tracking", "Sales leaderboards"],
    "dataAccepted": ["Time periods", "Rankings", "Categories"],
    "processes": "Visualizes movement in rankings."
  },
  {
    "id": "matrix-table-chart",
    "name": "Matrix Table",
    "primaryDataType": "Multidimensional Data",
    "bestUsedFor": "Cross-tab reporting and analysis",
    "description": "A multidimensional table with rows, columns, and aggregated values.",
    "useCases": ["Financial reporting", "Sales analysis", "Operational dashboards"],
    "dataAccepted": ["Dimensions", "Measures"],
    "processes": "Aggregates and summarizes data across dimensions."
  },
  {
    "id": "data-table",
    "name": "Theta Data Table",
    "primaryDataType": "Structured Tabular Data",
    "bestUsedFor": "Detailed record display and reporting",
    "description": "A tabular display of detailed records.",
    "useCases": ["Transaction reporting", "Customer records", "Audit reviews"],
    "dataAccepted": ["Structured tabular data"],
    "processes": "Displays raw or summarized data."
  },
  {
    "id": "radar-chart",
    "name": "Radar Chart",
    "primaryDataType": "Multiple Categories + Scores",
    "bestUsedFor": "Performance and capability comparison",
    "description": "Displays multiple variables on radial axes.",
    "useCases": ["Skill assessments", "Product comparisons", "Performance evaluation"],
    "dataAccepted": ["Categories", "Numerical scores"],
    "processes": "Compares multiple dimensions simultaneously."
  },
  {
    "id": "polar-area-chart",
    "name": "Polar Area Chart",
    "primaryDataType": "Category + Numeric",
    "bestUsedFor": "Radial comparison of categories",
    "description": "A circular chart where segment size and radius represent values.",
    "useCases": ["Marketing channel performance", "Brand analysis", "Campaign comparison"],
    "dataAccepted": ["Categories", "Numerical values"],
    "processes": "Compares categories in a radial format."
  },
  {
    "id": "candle-chart",
    "name": "Candle Chart",
    "primaryDataType": "OHLC Financial Data + Time",
    "bestUsedFor": "Financial and trading analysis",
    "description": "Shows price movements using open, high, low, and close values.",
    "useCases": ["Stock market analysis", "Cryptocurrency tracking", "Commodity trading"],
    "dataAccepted": ["Open price", "High price", "Low price", "Close price", "Time"],
    "processes": "Visualizes market volatility and trends."
  },
  {
    "id": "combo-chart",
    "name": "Combo Chart",
    "primaryDataType": "Mixed Measures + Categories/Time",
    "bestUsedFor": "Comparing multiple metrics in one chart",
    "description": "Combines multiple chart types, typically bars and lines.",
    "useCases": ["Sales vs Growth Rate", "Revenue vs Target", "Volume vs Profit"],
    "dataAccepted": ["Categories or time", "Multiple numerical measures"],
    "processes": "Compares different metrics in one view."
  },
  {
    "id": "logarithmic-chart",
    "name": "Logarithmic Chart",
    "primaryDataType": "Wide-Range Numeric Data",
    "bestUsedFor": "Exponential growth and scale analysis",
    "description": "Uses a logarithmic scale instead of a linear scale.",
    "useCases": ["Exponential growth analysis", "Population studies", "Scientific measurements"],
    "dataAccepted": ["Numerical values spanning large ranges"],
    "processes": "Compresses large values while preserving relationships."
  },
  {
    "id": "box-plot",
    "name": "Box & Whisker Plot",
    "primaryDataType": "Numerical Dataset",
    "bestUsedFor": "Distribution, spread, and outlier detection",
    "description": "Displays data distribution and variability.",
    "useCases": ["Statistical analysis", "Quality assurance", "Performance comparison"],
    "dataAccepted": ["Numerical datasets"],
    "processes": "Calculates median, quartiles, range, and outliers."
  },
  {
    "id": "cohort-analysis",
    "name": "Cohort Analysis",
    "primaryDataType": "User/Customer Activity Data",
    "bestUsedFor": "Retention and churn analysis",
    "description": "Tracks groups of users over time.",
    "useCases": ["Customer retention", "Subscription analysis", "Product engagement"],
    "dataAccepted": ["User IDs", "Cohort dates", "Activity dates"],
    "processes": "Measures retention and churn patterns."
  },
  {
    "id": "project-information",
    "name": "Project Information",
    "primaryDataType": "Project Metadata + KPIs",
    "bestUsedFor": "Project status and portfolio tracking",
    "description": "A dashboard component displaying project metadata and KPIs.",
    "useCases": ["Project monitoring", "Portfolio management", "Resource planning"],
    "dataAccepted": ["Project details", "Status indicators", "Dates and metrics"],
    "processes": "Summarizes project performance and status."
  },
  {
    "id": "media-widget",
    "name": "Photo and Video",
    "primaryDataType": "Images, Videos, Metadata",
    "bestUsedFor": "Visual evidence, monitoring, and multimedia reporting",
    "description": "Visual media components embedded in dashboards.",
    "useCases": ["Site inspections", "Marketing campaigns", "Security monitoring", "Product showcases"],
    "dataAccepted": ["Image files", "Video files", "Metadata"],
    "processes": "Displays multimedia content alongside analytics."
  }
];
