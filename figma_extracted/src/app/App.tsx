import { useState, useEffect, useRef } from "react";
import {
  Search, ShoppingCart, Heart, Bell, User, Menu, X,
  Truck, ShieldCheck, RefreshCw, Headphones, Star, ArrowRight,
  Play, ChevronLeft, ChevronRight, MapPin, Mail, Globe,
  Instagram, Twitter, Facebook, Youtube, Linkedin, CheckCircle,
  Package, Award, Clock, Smartphone, Monitor, Laptop, Shirt,
  Home, Leaf, Dumbbell, Book, Car, PawPrint, Baby, Sparkles,
  Flame, Gift, CreditCard, RotateCcw, Apple, QrCode, Send,
  Eye, TrendingUp, Cpu, Shield
} from "lucide-react";

// ── Static data ────────────────────────────────────────────────────────────
const NAV = ["Home","Shop","Categories","Brands","Deals","New Arrivals","Best Sellers","Flash Sale","About","Contact"];

const CATEGORIES = [
  { icon: Monitor,    label:"Electronics"    },
  { icon: Shirt,      label:"Fashion"        },
  { icon: Smartphone, label:"Mobiles"        },
  { icon: Laptop,     label:"Laptops"        },
  { icon: Home,       label:"Home & Kitchen" },
  { icon: Leaf,       label:"Beauty"         },
  { icon: Package,    label:"Grocery"        },
  { icon: Dumbbell,   label:"Sports"         },
  { icon: Book,       label:"Books"          },
  { icon: Baby,       label:"Toys"           },
  { icon: Car,        label:"Automotive"     },
  { icon: PawPrint,   label:"Pet Care"       },
];

const PRODUCTS = [
  { id:1,  name:"Sony WH-1000XM5 Headphones",    price:24999, orig:34999, rating:4.8, reviews:2847, disc:29, badge:"Bestseller",
    img:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop&auto=format" },
  { id:2,  name:"Apple iPhone 15 Pro Max 256GB",  price:134999,orig:159999,rating:4.9, reviews:5621, disc:16, badge:"Hot",
    img:"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop&auto=format" },
  { id:3,  name:'Samsung 65" QLED 4K Smart TV',   price:79999, orig:99999, rating:4.7, reviews:1203, disc:20, badge:"Deal",
    img:"https://images.unsplash.com/photo-1593359677879-a4bb92f4834f?w=500&h=500&fit=crop&auto=format" },
  { id:4,  name:"Nike Air Max 270 Running Shoes",  price:8999,  orig:12999, rating:4.6, reviews:3891, disc:31, badge:"Trending",
    img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop&auto=format" },
  { id:5,  name:'MacBook Pro 14" M3 Pro 512GB',   price:199999,orig:229999,rating:4.9, reviews:987,  disc:13, badge:"New",
    img:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop&auto=format" },
  { id:6,  name:"Dyson V15 Detect Vacuum",         price:44999, orig:59999, rating:4.8, reviews:762,  disc:25, badge:"Premium",
    img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&auto=format" },
  { id:7,  name:"Levi's 511 Slim Fit Jeans",       price:2999,  orig:4999,  rating:4.5, reviews:6234, disc:40, badge:"Popular",
    img:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop&auto=format" },
  { id:8,  name:"Instant Pot Duo 7-in-1 6Qt",      price:7499,  orig:9999,  rating:4.7, reviews:4521, disc:25, badge:"Deal",
    img:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format" },
];

const FLASH = [
  { id:1, name:"AirPods Pro 2nd Gen",    price:19999, orig:29999, stock:23, sold:77,
    img:"https://images.unsplash.com/photo-1588423771073-b8903fead714?w=400&h=400&fit=crop&auto=format" },
  { id:2, name:"iPad Air 5th Gen 256GB", price:54999, orig:74999, stock:12, sold:88,
    img:"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop&auto=format" },
  { id:3, name:"Samsung Galaxy Watch 6", price:14999, orig:24999, stock:41, sold:59,
    img:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&auto=format" },
];

const FEATURED = [
  { id:1, title:"Premium Sound. Zero Compromise.", sub:"Sony WH-1000XM5 — Industry-leading noise cancellation with 30-hour battery life.", cta:"Shop Headphones",
    img:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=500&fit=crop&auto=format", tag:"Editor's Choice" },
  { id:2, title:"Power That Fits in Your Pocket.",  sub:"iPhone 15 Pro Max — Titanium design meets the world's fastest mobile chip.", cta:"Explore iPhones",
    img:"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=700&h=500&fit=crop&auto=format", tag:"Top Rated" },
  { id:3, title:"Run the Future. In Style.",         sub:"Nike Air Max 270 — Engineered for comfort with next-gen responsive foam.", cta:"Shop Footwear",
    img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&h=500&fit=crop&auto=format", tag:"Trending Now" },
];

const AI_RECS = [
  { id:1, name:"Bose QuietComfort 45",  price:22999, rating:4.7,
    img:"https://images.unsplash.com/photo-1546435770-a3e736be0294?w=400&h=400&fit=crop&auto=format" },
  { id:2, name:"Google Pixel 8 Pro",    price:89999, rating:4.6,
    img:"https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop&auto=format" },
  { id:3, name:'LG 27" 4K Monitor',     price:29999, rating:4.8,
    img:"https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop&auto=format" },
  { id:4, name:"Logitech MX Master 3",  price:8499,  rating:4.9,
    img:"https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&h=400&fit=crop&auto=format" },
];

const REVIEWS = [
  { id:1, name:"Priya Sharma",  loc:"Mumbai",    rating:5, text:"ANGADIX is my go-to for everything. Fast delivery, genuine products, and the prices are unbeatable. Ordered an iPhone and got it in 2 days!", avatar:"PS" },
  { id:2, name:"Rahul Verma",   loc:"Delhi",     rating:5, text:"The customer support is incredible. Had an issue with my order and it was resolved within an hour. Highly recommend this platform!", avatar:"RV" },
  { id:3, name:"Ananya Patel",  loc:"Bangalore", rating:4, text:"Great selection of products. I always find exactly what I'm looking for. The app is smooth and checkout is super quick.", avatar:"AP" },
];

const BRANDS = ["SONY","APPLE","SAMSUNG","NIKE","LG","BOSCH","DYSON","LEVI'S"];

const HERO_SLIDES = [
  { tag:"Premium Collection", title:"High-Quality Products", sub:"Explore a modern marketplace spanning all product categories.", cta1:"Shop Now", cta2:"Explore Collection",
    img:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=500&fit=crop&auto=format" },
  { tag:"New Arrivals 2024",  title:"Innovation at Your Fingertips", sub:"Latest tech, fashion, and lifestyle products delivered to your door.", cta1:"Discover More", cta2:"View Catalog",
    img:"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=500&fit=crop&auto=format" },
  { tag:"Flash Deals Live",   title:"Save Big Today", sub:"Exclusive limited-time offers on premium brands. Don't miss out.", cta1:"Grab Deals", cta2:"See All Offers",
    img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=500&fit=crop&auto=format" },
];

// ── Hooks ──────────────────────────────────────────────────────────────────
function useCountdown(target: Date) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, target.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return { h, m, s };
}

// ── Sub-components ─────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12}
          className={i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted"} />
      ))}
    </span>
  );
}

function Chip({ children, variant = "primary" }: { children: React.ReactNode; variant?: "primary"|"accent"|"sale"|"muted" }) {
  const cls = {
    primary: "bg-primary text-primary-foreground",
    accent:  "bg-accent text-accent-foreground",
    sale:    "bg-destructive text-destructive-foreground",
    muted:   "bg-muted text-muted-foreground",
  }[variant];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold font-body ${cls}`}>
      {children}
    </span>
  );
}

function SectionHead({ badge, title, sub }: { badge: string; title: string; sub?: string }) {
  return (
    <div className="text-center mb-10">
      <Chip variant="accent">{badge}</Chip>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mt-2">{title}</h2>
      {sub && <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm font-body">{sub}</p>}
    </div>
  );
}

function TimeDig({ val, label }: { val: number; label: string }) {
  const s = String(val).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="bg-foreground text-background rounded-lg w-14 h-14 flex items-center justify-center font-heading text-2xl font-bold tabular-nums">
        {s}
      </div>
      <span className="text-[10px] text-primary-foreground/70 mt-1 uppercase tracking-wider font-body">{label}</span>
    </div>
  );
}

function ProdCard({ p }: { p: typeof PRODUCTS[0] }) {
  const [wish, setWish] = useState(false);
  const [added, setAdded] = useState(false);
  const handleAdd = () => { setAdded(true); setTimeout(() => setAdded(false), 1500); };
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <div className="relative overflow-hidden">
        <img src={p.img} alt={p.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Chip variant="primary">{p.badge}</Chip>
          <Chip variant="sale">-{p.disc}%</Chip>
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button onClick={() => setWish(!wish)}
            className="w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-card transition-colors">
            <Heart size={15} className={wish ? "fill-destructive text-destructive" : "text-muted-foreground"} />
          </button>
          <button className="w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-card transition-colors">
            <Eye size={15} className="text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="p-3 flex flex-col flex-1 gap-2">
        <p className="text-xs text-muted-foreground font-body">{p.badge} Product</p>
        <h3 className="font-heading font-semibold text-foreground text-sm leading-snug line-clamp-2">{p.name}</h3>
        <div className="flex items-center gap-1">
          <Stars rating={p.rating} />
          <span className="text-xs text-muted-foreground font-body">({p.reviews.toLocaleString()})</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-heading font-bold text-primary">&#8377;{p.price.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground line-through font-body">&#8377;{p.orig.toLocaleString()}</span>
        </div>
        <button onClick={handleAdd}
          className={`mt-auto w-full py-2 rounded-lg text-sm font-semibold font-body transition-all duration-200 ${added ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
          {added ? "Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

type CarouselItem = typeof PRODUCTS[0] | typeof AI_RECS[0];

function Carousel({ items, cols = 4, renderItem }: {
  items: CarouselItem[];
  cols?: number;
  renderItem: (item: CarouselItem, i: number) => React.ReactNode;
}) {
  const [idx, setIdx] = useState(0);
  const max = Math.max(0, items.length - cols);
  const pct = 100 / cols;
  const gap = (cols - 1) * 16 / cols;
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div className="flex gap-4 transition-transform duration-300"
          style={{ transform: `translateX(calc(-${idx} * (${pct}% + ${gap / (cols - 1 || 1)}px)))` }}>
          {items.map((item, i) => (
            <div key={i} style={{ flex: `0 0 calc(${pct}% - ${gap}px)` }}>
              {renderItem(item, i)}
            </div>
          ))}
        </div>
      </div>
      {idx > 0 && (
        <button onClick={() => setIdx(i => Math.max(0, i - 1))}
          className="absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-secondary transition-colors z-10">
          <ChevronLeft size={18} className="text-foreground" />
        </button>
      )}
      {idx < max && (
        <button onClick={() => setIdx(i => Math.min(max, i + 1))}
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-secondary transition-colors z-10">
          <ChevronRight size={18} className="text-foreground" />
        </button>
      )}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [heroIdx, setHeroIdx]       = useState(0);
  const [newsletter, setNewsletter] = useState("");
  const [nlDone, setNlDone]         = useState(false);
  const [dismissed, setDismissed]   = useState<number[]>([]);

  const flashTarget = useRef(new Date(Date.now() + 10 * 3600 * 1000 + 25 * 60 * 1000));
  const { h, m, s } = useCountdown(flashTarget.current);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  const recentlyViewed = PRODUCTS.filter(p => !dismissed.includes(p.id)).slice(0, 4);

  return (
    <div className="font-body bg-background text-foreground min-h-screen">

      {/* ── Announcement Bar ───────────────────────────────── */}
      <div
        className="text-primary-foreground text-xs py-2 px-4 text-center font-semibold flex items-center justify-center gap-6 flex-wrap"
        style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
        <span className="flex items-center gap-1.5"><Truck size={13}/> Free Shipping Promote</span>
        <span className="hidden sm:flex items-center gap-1.5"><Gift size={13}/> Festival Offers</span>
        <span className="hidden md:flex items-center gap-1.5"><Package size={13}/> Order Tracking</span>
        <span className="hidden md:flex items-center gap-1.5"><Headphones size={13}/> Help &amp; Support</span>
        <span className="flex items-center gap-1.5"><Globe size={13}/> Language Selector &#9662;</span>
      </div>

      {/* ── Header ─────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 border-b border-border transition-all duration-300 ${scrolled ? "bg-card/90 backdrop-blur-md shadow-sm" : "bg-card"}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="#" className="font-heading font-extrabold text-xl tracking-tight text-primary shrink-0">ANGADIX</a>
          <div className="flex-1 hidden md:flex items-center max-w-xl mx-auto">
            <div className="flex items-center border border-border rounded-l-lg px-3 py-2 bg-secondary/50 gap-1 text-sm text-muted-foreground cursor-pointer hover:bg-secondary transition-colors whitespace-nowrap">
              Category Dropdown &#9662;
            </div>
            <input type="text" placeholder="Search Bar"
              className="flex-1 border-y border-border bg-secondary/30 px-3 py-2 text-sm outline-none text-foreground placeholder:text-muted-foreground" />
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-r-lg hover:bg-primary/90 transition-colors">
              <Search size={16} />
            </button>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <button className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} className="text-foreground" /> : <Menu size={20} className="text-foreground" />}
            </button>
            {([
              { icon: Headphones, label:"Wishlist",      count:0 },
              { icon: ShoppingCart,label:"Cart",         count:5 },
              { icon: Shield,     label:"Notifications", count:2 },
              { icon: Cpu,        label:"Compare",       count:0 },
            ] as const).map(({ icon: Icon, label, count }) => (
              <button key={label}
                className="hidden md:flex flex-col items-center p-2 rounded-lg hover:bg-secondary transition-colors relative gap-0.5">
                <div className="relative">
                  <Icon size={20} className="text-foreground" />
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
              </button>
            ))}
            <button className="hidden md:flex flex-col items-center p-2 rounded-lg hover:bg-secondary transition-colors gap-0.5">
              <Heart size={20} className="text-foreground" />
              <span className="text-[10px] text-muted-foreground leading-none">Wishlist</span>
            </button>
            <button className="hidden md:flex flex-col items-center p-2 rounded-lg hover:bg-secondary transition-colors gap-0.5">
              <Bell size={20} className="text-foreground" />
              <span className="text-[10px] text-muted-foreground leading-none">Alerts</span>
            </button>
            <button className="hidden md:flex flex-col items-center p-2 rounded-lg hover:bg-secondary transition-colors gap-0.5">
              <User size={20} className="text-foreground" />
              <span className="text-[10px] text-muted-foreground leading-none">Account</span>
            </button>
          </div>
        </div>
        {/* Nav */}
        <nav className={`border-t border-border overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-96" : "max-h-0 md:max-h-20"}`}>
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row md:items-center gap-1 md:gap-0">
            {NAV.map((item, i) => (
              <a key={item} href="#"
                className={`px-3 py-1.5 rounded-lg text-sm font-body transition-colors whitespace-nowrap ${i === 0 ? "text-primary font-semibold border-b-2 border-primary" : "text-foreground hover:text-primary hover:bg-secondary"}`}>
                {item}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <main>

        {/* ── Hero ───────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-10 md:py-16"
          style={{ background: "linear-gradient(135deg, var(--secondary) 0%, var(--background) 55%, var(--muted) 100%)" }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-10 min-h-[340px]">
              <div className="flex-1 space-y-5">
                <Chip variant="accent">{HERO_SLIDES[heroIdx].tag}</Chip>
                <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
                  {HERO_SLIDES[heroIdx].title}
                </h1>
                <p className="text-muted-foreground text-sm md:text-base max-w-md font-body">
                  {HERO_SLIDES[heroIdx].sub}
                </p>
                <div className="flex gap-3 flex-wrap">
                  <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold font-body hover:bg-primary/90 transition-all hover:shadow-md">
                    {HERO_SLIDES[heroIdx].cta1}
                  </button>
                  <button className="border border-primary text-primary px-6 py-3 rounded-lg font-semibold font-body hover:bg-secondary transition-colors">
                    {HERO_SLIDES[heroIdx].cta2}
                  </button>
                </div>
                <div className="flex gap-2 pt-2">
                  {HERO_SLIDES.map((_, i) => (
                    <button key={i} onClick={() => setHeroIdx(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === heroIdx ? "bg-primary w-6" : "bg-muted w-2 hover:bg-primary/40"}`} />
                  ))}
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-sm">
                  <div className="absolute inset-0 rounded-2xl blur-2xl opacity-20"
                    style={{ background: "var(--primary)" }} />
                  <img src={HERO_SLIDES[heroIdx].img} alt="Hero product"
                    className="relative rounded-2xl shadow-2xl w-full object-cover h-64 md:h-80 transition-all duration-500" />
                  <div className="absolute -bottom-4 -right-4 bg-card/90 backdrop-blur-sm border border-border rounded-xl px-4 py-3 shadow-lg">
                    <p className="text-xs text-muted-foreground font-body">Starting from</p>
                    <p className="font-heading font-bold text-primary text-lg">&#8377;2,999</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Service Highlights ─────────────────────────────── */}
        <section className="py-8 border-y border-border bg-card">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="font-heading text-xl font-bold text-foreground text-center mb-6">Service Highlights</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Truck,       title:"Free Shipping",        sub:"Free nationwide delivery and free returns on all orders."   },
                { icon: Shield,      title:"Secure Payment",       sub:"Modern encryption ensures your payment data is protected."  },
                { icon: RefreshCw,   title:"Easy Returns",         sub:"Easy customer-friendly 30-day easy returns and refunds."    },
                { icon: Headphones,  title:"24/7 Customer Support",sub:"24/7 outstanding customer support available anytime."      },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-start gap-3 p-4 rounded-xl hover:bg-secondary transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed font-body">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Categories ─────────────────────────────────────── */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHead badge="Browse" title="Shop by Category" sub="Explore our wide range of categories and find what you need." />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {CATEGORIES.map(({ icon: Icon, label }) => (
                <button key={label}
                  className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-secondary hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
                  <div className="w-12 h-12 rounded-xl bg-secondary group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <span className="font-body font-medium text-foreground text-xs text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Flash Sale ─────────────────────────────────────── */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--muted-foreground) 100%)" }}>
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                  <div>
                    <Chip variant="accent">Promotions Promo</Chip>
                    <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-primary-foreground mt-2">
                      Countdown Timer
                    </h2>
                    <p className="text-primary-foreground/80 text-sm mt-1 font-body">
                      Premium product render, discount product, and promotion.
                    </p>
                    <button className="mt-3 bg-card text-primary px-5 py-2 rounded-lg text-sm font-semibold font-body hover:bg-secondary transition-colors">
                      CTA
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <TimeDig val={h} label="HRS" />
                    <span className="font-heading text-2xl font-bold text-primary-foreground">:</span>
                    <TimeDig val={m} label="MIN" />
                    <span className="font-heading text-2xl font-bold text-primary-foreground">:</span>
                    <TimeDig val={s} label="SEC" />
                    <div className="bg-accent text-accent-foreground rounded-xl px-4 py-3 text-center ml-2">
                      <div className="font-heading font-extrabold text-sm">Discount</div>
                      <div className="text-xs font-body">Badge</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {FLASH.map(item => (
                    <div key={item.id} className="rounded-xl p-4 flex gap-3 items-center"
                      style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                      <img src={item.img} alt={item.name} className="w-20 h-20 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Chip variant="accent">Discount Badge</Chip>
                        <p className="font-heading font-semibold text-primary-foreground text-sm mt-1 truncate">{item.name}</p>
                        <p className="font-heading font-bold text-primary-foreground text-lg">&#8377;{item.price.toLocaleString()}</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-primary-foreground/70 mb-1 font-body">
                            <span>Sold {item.sold}%</span><span>{item.stock} left</span>
                          </div>
                          <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }}>
                            <div className="h-full rounded-full bg-accent" style={{ width: `${item.sold}%` }} />
                          </div>
                        </div>
                        <button className="mt-2 w-full bg-card text-primary rounded-lg py-1.5 text-xs font-semibold font-body hover:bg-secondary transition-colors">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Today's Deals ──────────────────────────────────── */}
        <section className="py-12 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Chip variant="sale"><TrendingUp size={11} className="inline mr-1"/>Hot Deals</Chip>
                <h2 className="font-heading text-2xl font-bold text-foreground mt-1">{"Today's Deals"}</h2>
              </div>
              <a href="#" className="text-primary text-sm font-semibold font-body flex items-center gap-1 hover:text-primary/80">
                View All <ArrowRight size={14} />
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PRODUCTS.slice(0, 4).map(p => <ProdCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>

        {/* ── Trending Products ───────────────────────────────── */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Chip variant="primary"><TrendingUp size={11} className="inline mr-1"/>Trending</Chip>
                <h2 className="font-heading text-2xl font-bold text-foreground mt-1">Trending Products</h2>
              </div>
              <a href="#" className="text-primary text-sm font-semibold font-body flex items-center gap-1 hover:text-primary/80">
                See all <ArrowRight size={14} />
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PRODUCTS.slice(4).map(p => <ProdCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>

        {/* ── Best Sellers ───────────────────────────────────── */}
        <section className="py-12 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Chip variant="accent"><Award size={11} className="inline mr-1"/>Best Sellers</Chip>
                <h2 className="font-heading text-2xl font-bold text-foreground mt-1">Best Sellers</h2>
              </div>
              <a href="#" className="text-primary text-sm font-semibold font-body flex items-center gap-1 hover:text-primary/80">
                See all <ArrowRight size={14} />
              </a>
            </div>
            <Carousel items={PRODUCTS} cols={4} renderItem={(item) => <ProdCard p={item as typeof PRODUCTS[0]} />} />
          </div>
        </section>

        {/* ── New Arrivals ───────────────────────────────────── */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Chip variant="accent"><Sparkles size={11} className="inline mr-1"/>Just In</Chip>
                <h2 className="font-heading text-2xl font-bold text-foreground mt-1">New Arrivals</h2>
              </div>
              <a href="#" className="text-primary text-sm font-semibold font-body flex items-center gap-1 hover:text-primary/80">
                See all <ArrowRight size={14} />
              </a>
            </div>
            <Carousel items={[...PRODUCTS].reverse()} cols={4} renderItem={(item) => <ProdCard p={item as typeof PRODUCTS[0]} />} />
          </div>
        </section>

        {/* ── Featured Products ──────────────────────────────── */}
        <section className="py-12 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHead badge="Featured" title="Featured Products" sub="Handpicked premium selections curated by our experts." />
            <div className="space-y-6">
              {FEATURED.map((f, i) => (
                <div key={f.id}
                  className={`bg-card border border-border rounded-2xl overflow-hidden flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} hover:shadow-lg transition-shadow`}>
                  <div className="md:w-1/2 relative overflow-hidden">
                    <img src={f.img} alt={f.title}
                      className="w-full h-56 md:h-64 object-cover hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                      <Chip variant="primary">{f.tag}</Chip>
                    </div>
                  </div>
                  <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
                    <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-3">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-body">{f.sub}</p>
                    <div className="flex gap-3">
                      <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold font-body hover:bg-primary/90 transition-all text-sm">
                        {f.cta}
                      </button>
                      <button className="border border-border text-foreground px-5 py-2.5 rounded-lg font-semibold font-body hover:bg-secondary transition-colors text-sm">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI Recommended ─────────────────────────────────── */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Chip variant="accent"><Cpu size={11} className="inline mr-1"/>AI Powered</Chip>
                <h2 className="font-heading text-2xl font-bold text-foreground mt-1">AI Recommended For You</h2>
              </div>
              <a href="#" className="text-primary text-sm font-semibold font-body flex items-center gap-1 hover:text-primary/80">
                See all <ArrowRight size={14} />
              </a>
            </div>
            <div className="bg-secondary/40 rounded-2xl p-6 border border-border">
              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                {["Personalized Recommendations","Frequently Bought Together","Similar Products"].map(t => (
                  <div key={t}
                    className="bg-card rounded-xl py-3 px-2 border border-border hover:border-primary/30 cursor-pointer transition-colors">
                    <p className="text-xs font-semibold text-foreground font-body">{t}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {AI_RECS.map(p => (
                  <div key={p.id}
                    className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-all group">
                    <img src={p.img} alt={p.name}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="p-3">
                      <p className="font-heading font-semibold text-foreground text-xs leading-snug mb-1">{p.name}</p>
                      <Stars rating={p.rating} />
                      <p className="font-heading font-bold text-primary text-sm mt-1">&#8377;{p.price.toLocaleString()}</p>
                      <div className="flex gap-1.5 mt-2">
                        <button className="flex-1 bg-primary text-primary-foreground text-[10px] py-1.5 rounded-lg font-semibold font-body hover:bg-primary/90 transition-colors">
                          Add to Cart
                        </button>
                        <button className="flex-1 border border-border text-foreground text-[10px] py-1.5 rounded-lg font-body hover:bg-secondary transition-colors">
                          Quick View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Top Brands ─────────────────────────────────────── */}
        <section className="py-12 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Chip variant="muted"><Award size={11} className="inline mr-1"/>Partners</Chip>
                <h2 className="font-heading text-2xl font-bold text-foreground mt-1">Top Brands</h2>
              </div>
              <a href="#" className="text-primary text-sm font-semibold font-body flex items-center gap-1 hover:text-primary/80">
                View All <ArrowRight size={14} />
              </a>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {BRANDS.map(b => (
                <div key={b}
                  className="bg-card border border-border rounded-xl py-4 px-2 flex items-center justify-center hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
                  <span className="font-heading font-bold text-foreground text-xs text-center">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Promotional Banners ────────────────────────────── */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHead badge="Offers" title="Promotional Banner Section" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title:"Bank Offers",        sub:"Exclusive promotion offer garantium cannot claim Offers.", cta:"Learn More", icon: CreditCard, accent: false },
                { title:"Festival Sale",      sub:"Exclusive celebration garantium cannot claim Offers.",    cta:"Shop Sale",  icon: Gift,       accent: true  },
                { title:"Limited-Time Offers",sub:"Assoicorte Offers aventurine offer.",                    cta:"Grab Now",   icon: Clock,      accent: false },
              ].map(({ title, sub, cta, icon: Icon, accent }) => (
                <div key={title}
                  className={`rounded-2xl p-6 flex items-center gap-4 border ${accent ? "border-accent/30 bg-accent/10" : "border-border bg-card"} hover:shadow-md transition-shadow`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent ? "bg-accent text-accent-foreground" : "bg-secondary text-primary"}`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-heading font-bold text-foreground">{title}</h4>
                    <p className="text-muted-foreground text-xs mt-0.5 font-body">{sub}</p>
                  </div>
                  <button className={`px-4 py-2 rounded-lg text-sm font-semibold font-body transition-colors shrink-0 ${accent ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                    {cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── For Logged In Users ────────────────────────────── */}
        <section className="py-12 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Chip variant="primary">Personalized</Chip>
                <h2 className="font-heading text-2xl font-bold text-foreground mt-1">For Logged In Users</h2>
              </div>
              <a href="#" className="text-primary text-sm font-semibold font-body flex items-center gap-1 hover:text-primary/80">
                See all <ArrowRight size={14} />
              </a>
            </div>
            <Carousel items={PRODUCTS} cols={4} renderItem={(item) => <ProdCard p={item as typeof PRODUCTS[0]} />} />
          </div>
        </section>

        {/* ── Recently Viewed ────────────────────────────────── */}
        {recentlyViewed.length > 0 && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <Chip variant="muted"><Clock size={11} className="inline mr-1"/>History</Chip>
                  <h2 className="font-heading text-2xl font-bold text-foreground mt-1">Recently Viewed</h2>
                </div>
                <button
                  onClick={() => setDismissed(PRODUCTS.map(p => p.id))}
                  className="text-muted-foreground text-sm font-body hover:text-foreground transition-colors">
                  Clear all
                </button>
              </div>
              <Carousel
                items={recentlyViewed}
                cols={4}
                renderItem={(item) => {
                  const p = item as typeof PRODUCTS[0];
                  return (
                    <div className="relative">
                      <ProdCard p={p} />
                      <button
                        onClick={() => setDismissed(d => [...d, p.id])}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-foreground/60 text-background flex items-center justify-center text-xs hover:bg-foreground transition-colors z-10">
                        &#215;
                      </button>
                    </div>
                  );
                }}
              />
            </div>
          </section>
        )}

        {/* ── Customer Reviews ───────────────────────────────── */}
        <section className="py-12 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHead badge="Reviews" title="Customer Reviews" sub="What our customers say about their shopping experience." />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { val:"4.8★", label:"Average Rating"    },
                { val:"2M+",  label:"Happy Customers"   },
                { val:"98%",  label:"Satisfaction Rate" },
                { val:"50K+", label:"Reviews"           },
              ].map(({ val, label }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-5 text-center">
                  <p className="font-heading font-extrabold text-2xl text-primary">{val}</p>
                  <p className="text-muted-foreground text-xs mt-1 font-body">{label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {REVIEWS.map(r => (
                <div key={r.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-sm">
                      {r.avatar}
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-foreground text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
                        <MapPin size={10}/>{r.loc}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <CheckCircle size={16} className="text-accent inline" />
                      <p className="text-[10px] text-muted-foreground font-body">Verified Badge</p>
                    </div>
                  </div>
                  <Stars rating={r.rating} />
                  <p className="text-foreground/80 text-sm mt-2 leading-relaxed font-body">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Choose ANGADIX ─────────────────────────────── */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHead badge="Our Promise" title="Why Choose ANGADIX" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { icon: ShieldCheck, title:"Genuine Products",  sub:"100% authentic certified"     },
                { icon: CreditCard,  title:"Secure Payments",   sub:"Multiple payment options"     },
                { icon: Truck,       title:"Fast Delivery",     sub:"Same day in metro cities"     },
                { icon: RotateCcw,   title:"Easy Returns",      sub:"30-day hassle-free policy"    },
                { icon: Headphones,  title:"24/7 Support",      sub:"Always here to help you"     },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title}
                  className="bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-body">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mobile App Promotion ───────────────────────────── */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div
              className="rounded-2xl overflow-hidden flex flex-col md:flex-row items-center gap-8 p-8 md:p-12"
              style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary-foreground) 100%)" }}>
              <div className="flex-1 text-primary-foreground space-y-4">
                <Chip variant="accent">Mobile App</Chip>
                <h2 className="font-heading text-2xl md:text-3xl font-extrabold">
                  Mobile App Promotion
                </h2>
                <p className="text-primary-foreground/80 text-sm font-body">
                  GR Code Placeholder — get exclusive app-only deals, track orders in real-time, and enjoy a seamless shopping experience.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 bg-foreground text-background px-5 py-3 rounded-xl font-semibold font-body text-sm hover:bg-foreground/90 transition-colors">
                    <Apple size={18} /> App Store
                  </button>
                  <button className="flex items-center gap-2 bg-foreground text-background px-5 py-3 rounded-xl font-semibold font-body text-sm hover:bg-foreground/90 transition-colors">
                    <Play size={18} /> Google Play
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="bg-card rounded-xl p-5 text-center shadow-lg">
                  <p className="text-xs text-muted-foreground font-body mb-3 font-semibold">ANGADIX</p>
                  <QrCode size={80} className="text-primary mx-auto" />
                  <p className="text-xs text-muted-foreground mt-2 font-body">QR Code Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Newsletter ─────────────────────────────────────── */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div
              className="rounded-2xl p-8 md:p-12 text-center"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
              <Chip variant="accent"><Mail size={11} className="inline mr-1"/>Subscribe</Chip>
              <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-primary-foreground mt-3 mb-2">
                Newsletter Section
              </h2>
              <p className="text-primary-foreground/80 text-sm mb-6 max-w-md mx-auto font-body">
                Email address for email subscriptions and promotions from ANGADIX.
              </p>
              {nlDone ? (
                <div className="flex items-center justify-center gap-2 text-primary-foreground font-semibold font-body">
                  <CheckCircle size={20} /> Thank you! You are subscribed.
                </div>
              ) : (
                <form
                  onSubmit={e => { e.preventDefault(); if(newsletter) setNlDone(true); }}
                  className="flex gap-0 max-w-sm mx-auto">
                  <input
                    type="email"
                    value={newsletter}
                    onChange={e => setNewsletter(e.target.value)}
                    placeholder="Enter email..."
                    className="flex-1 px-4 py-3 rounded-l-xl text-sm text-foreground bg-card outline-none font-body" />
                  <button
                    type="submit"
                    className="bg-foreground text-background px-5 py-3 rounded-r-xl font-semibold font-body text-sm hover:bg-foreground/90 transition-colors flex items-center gap-1">
                    <Send size={14} /> Join
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{ background: "var(--foreground)" }} className="text-background pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-10">
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-heading font-extrabold text-xl text-primary mb-3">ANGADIX</h3>
              <p className="text-background/60 text-xs leading-relaxed mb-4 font-body">
                Your trusted marketplace for all product categories.
              </p>
              <div className="flex gap-2">
                {([Instagram, Twitter, Facebook, Youtube, Linkedin] as const).map((Icon, i) => (
                  <a key={i} href="#"
                    className="w-7 h-7 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                    <Icon size={13} className="text-background" />
                  </a>
                ))}
              </div>
            </div>
            {[
              { head:"Company",          links:["Home","Categories","Brands","Deals","About Us","Careers"]          },
              { head:"Customer Service", links:["Customer Care","Privacy Policy","Terms of Service","Shipping Policy","Refund Policy","Track Order"] },
              { head:"My Account",       links:["My Profile","My Orders","My Wishlist","Payment Methods","Address Book","My Reviews"] },
              { head:"Policies",         links:["Return Policy","Warranty Info","Legal Disclaimer","Cookie Policy","Accessibility","Sitemap"] },
            ].map(({ head, links }) => (
              <div key={head}>
                <h4 className="font-heading font-semibold text-background/90 text-sm mb-3">{head}</h4>
                <ul className="space-y-1.5">
                  {links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-background/50 text-xs hover:text-background transition-colors font-body">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="font-heading font-semibold text-background/90 text-sm mb-3">Social Media Icons</h4>
              <div className="space-y-2 mb-4">
                {([Facebook, Instagram, Twitter, Youtube, Linkedin] as const).map((Icon, i) => (
                  <a key={i} href="#"
                    className="flex items-center gap-2 text-background/50 text-xs hover:text-background transition-colors font-body">
                    <Icon size={12} />
                    {["Facebook","Instagram","Twitter","YouTube","LinkedIn"][i]}
                  </a>
                ))}
              </div>
              <h4 className="font-heading font-semibold text-background/90 text-xs mb-2">Payment Method Icons</h4>
              <div className="flex flex-wrap gap-1">
                {["VISA","MC","AMEX","UPI","COD"].map(m => (
                  <span key={m}
                    className="px-2 py-0.5 bg-background/10 rounded text-[10px] text-background/70 font-semibold font-body">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-background/40 text-xs font-body">
              Copyright &#169; 2025 ANGADIX. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#"
                className="flex items-center gap-1 text-background/40 text-xs hover:text-background transition-colors font-body">
                <Apple size={13} /> App Store
              </a>
              <a href="#"
                className="flex items-center gap-1 text-background/40 text-xs hover:text-background transition-colors font-body">
                <Play size={13} /> Google Play
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
