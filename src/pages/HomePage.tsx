import { Link } from 'react-router-dom';
import { Heart, Trophy, HandHeart, Users, ArrowRight, Check, Star, Target, TrendingUp, Award } from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/Button';

export function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-6">
                <Heart size={14} />
                Golf for good
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Play Golf.<br />
                <span className="text-emerald-600">Win Prizes.</span><br />
                Support Charity.
              </h1>
              <p className="mt-6 text-lg text-slate-600 max-w-md leading-relaxed">
                Digital Heroes combines the thrill of a monthly draw with the joy of giving back.
                Enter your Stableford scores, get matched with draw numbers, and win while supporting causes you care about.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started Free
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/charities">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Explore Charities
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Check className="text-emerald-600" size={16} />
                  No setup fees
                </div>
                <div className="flex items-center gap-2">
                  <Check className="text-emerald-600" size={16} />
                  Cancel anytime
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl bg-white shadow-xl border border-slate-200 p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-slate-500">September Draw</p>
                    <p className="text-2xl font-bold text-slate-900">Prize Pool</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <Trophy className="text-emerald-600" size={24} />
                  </div>
                </div>
                <p className="text-4xl font-bold text-slate-900 mb-1">₹39,920</p>
                <p className="text-sm text-slate-500 mb-6">Based on 100 active subscribers</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                        <Star className="text-amber-600" size={16} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">5-Number Match</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">40% of pool</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200">
                        <Award className="text-slate-600" size={16} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">4-Number Match</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">35% of pool</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                        <Trophy className="text-emerald-600" size={16} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">3-Number Match</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">25% of pool</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Charity contribution</span>
                    <span className="font-bold text-emerald-600">10% minimum</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
              Four simple steps to start playing and giving back
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: 'Subscribe', desc: 'Choose a monthly or yearly plan to join the platform and participate in draws.', color: 'bg-blue-100 text-blue-600' },
              { icon: Trophy, title: 'Enter Scores', desc: 'Log your latest 5 Stableford golf scores. Your scores generate your draw numbers.', color: 'bg-emerald-100 text-emerald-600' },
              { icon: Target, title: 'Get Matched', desc: 'Each month, draw numbers are generated. Match 3, 4, or 5 numbers to win prizes.', color: 'bg-amber-100 text-amber-600' },
              { icon: HandHeart, title: 'Give Back', desc: 'A portion of your subscription goes to your chosen charity. You win, they win.', color: 'bg-rose-100 text-rose-600' },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <div className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-shadow">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${step.color} mb-4`}>
                      <Icon size={24} />
                    </div>
                    <div className="text-sm font-bold text-slate-400 mb-1">Step {i + 1}</div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Prize/Draw Explanation */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">How Prizes Work</h2>
              <p className="text-lg text-slate-600 mb-8">
                The prize pool grows with every active subscriber. When the draw happens, your numbers are compared to the generated draw numbers. Match more numbers, win bigger prizes.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 shrink-0">
                    <Star className="text-amber-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">5-Number Match — 40%</h4>
                    <p className="text-sm text-slate-600">The jackpot tier. If nobody matches all 5, the prize rolls over to the next draw.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 shrink-0">
                    <Award className="text-slate-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">4-Number Match — 35%</h4>
                    <p className="text-sm text-slate-600">A substantial prize. Split equally among all winners in this tier.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 shrink-0">
                    <Trophy className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">3-Number Match — 25%</h4>
                    <p className="text-sm text-slate-600">The entry-level prize. Split equally among all winners in this tier.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 text-white">
              <TrendingUp className="mb-4" size={32} />
              <h3 className="text-2xl font-bold mb-2">Jackpot Rollover</h3>
              <p className="text-emerald-50 mb-6">
                When no one matches all 5 numbers, the 5-number tier prize rolls over to the next month's draw. This means the jackpot can grow over time, creating even bigger winning opportunities.
              </p>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-emerald-50">Example: If 100 subscribers each pay ₹499/month, the prize pool is ₹39,920. The 5-number tier alone is ₹15,968.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charity Impact */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-1.5 text-sm font-medium text-rose-700 mb-4">
              <HandHeart size={14} />
              Charity Impact
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Every Subscription Makes a Difference</h2>
            <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
              You choose a charity and set your contribution percentage. A minimum of 10% of your subscription goes to your selected cause.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { value: '₹49.90', label: 'Monthly contribution at 10% of ₹499 plan' },
              { value: '5+', label: 'Featured charities to choose from' },
              { value: '100%', label: 'Transparency in where your money goes' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-3xl font-bold text-emerald-600">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/charities">
              <Button variant="outline" size="lg">
                Browse Charities
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Choose Your Plan</h2>
            <p className="mt-3 text-lg text-slate-600">Start playing and giving back today</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="rounded-xl border-2 border-slate-200 bg-white p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-1">Monthly</h3>
              <p className="text-sm text-slate-500 mb-4">Flexible month-to-month</p>
              <p className="text-4xl font-bold text-slate-900 mb-1">₹499<span className="text-lg font-normal text-slate-500">/month</span></p>
              <p className="text-sm text-slate-600 mb-6">Renews monthly. Cancel anytime.</p>
              <ul className="space-y-2 mb-6">
                {['Participate in monthly draws', 'Enter up to 5 golf scores', 'Choose your charity', 'Minimum 10% to charity', 'Win up to 40% of prize pool'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="text-emerald-600" size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button className="w-full" size="lg">Get Started</Button>
              </Link>
            </div>

            <div className="rounded-xl border-2 border-emerald-500 bg-white p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1 text-xs font-bold text-white">
                BEST VALUE
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">Yearly</h3>
              <p className="text-sm text-slate-500 mb-4">Save 2 months with annual billing</p>
              <p className="text-4xl font-bold text-slate-900 mb-1">₹4,990<span className="text-lg font-normal text-slate-500">/year</span></p>
              <p className="text-sm text-slate-600 mb-6">Renews annually. Cancel anytime.</p>
              <ul className="space-y-2 mb-6">
                {['Everything in Monthly', '2 months free', 'Priority draw participation', 'Choose your charity', 'Win up to 40% of prize pool'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="text-emerald-600" size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button className="w-full" size="lg">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="mx-auto mb-6 text-emerald-400" size={48} />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Become a Digital Hero?
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Join today and start making every round of golf count. Win prizes, support charity, and be part of something bigger.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup">
              <Button size="lg">
                Sign Up Now
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="bg-transparent text-white border-white/30 hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
