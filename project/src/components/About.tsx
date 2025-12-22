import { Award, Users, Star, Scissors } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Ekselencë e ndërtuar që nga viti 2008
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Në Elite Cuts, besojmë se një prerje e shkëlqyer është më shumë se një shërbim — është një formë arti.
                Ekipi ynë i barberëve profesionistë kombinon teknikat tradicionale me stilimet bashkëkohore për të ofruar
                rezultate të jashtëzakonshme çdo herë.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Me mbi 15 vite përvojë në industri, kemi ndërtuar reputacionin tonë mbi saktësinë, vëmendjen ndaj detajeve
                dhe përkushtimin maksimal ndaj kënaqësisë së klientëve. Çdo klient trajtohet individualisht dhe largohet
                me pamjen më të mirë të mundshme.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-amber-500 p-2 rounded-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">
                      Profesionistë të Certifikuar
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Barberë të licencuar dhe të trajnuar
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-amber-500 p-2 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">
                      10,000+ Klientë
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Të shërbyer me ekselencë
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Ambient i brendshëm i barber shop-it"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-amber-500 p-6 rounded-xl shadow-xl">
                <div className="flex items-center space-x-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-white fill-white" />
                  ))}
                </div>
                <p className="text-white font-bold text-lg">Vlerësim 5.0</p>
                <p className="text-white/90 text-sm">
                  Bazuar në mbi 500 komente
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-12 shadow-2xl">
            <div className="text-center mb-12">
              <Scissors className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-white mb-4">
                Pse të zgjidhni Elite Cuts?
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-amber-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-amber-500" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">
                  Mjeshtëri Profesionale
                </h4>
                <p className="text-gray-300">
                  Barberët tanë janë profesionistë të trajnuar me përvojë shumëvjeçare në teknikat klasike dhe moderne.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-amber-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-amber-500" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">
                  Produkte Premium
                </h4>
                <p className="text-gray-300">
                  Përdorim vetëm produkte cilësore për të garantuar pamje dhe ndjesi të shkëlqyer.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-amber-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-amber-500" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">
                  Shërbim i Personalizuar
                </h4>
                <p className="text-gray-300">
                  Çdo klient merr vëmendje individuale dhe stilim të përshtatur sipas preferencave personale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
