import type { ReactNode } from "react";

export const DEMO_PAGES_COUNT = 8;

export function DemoCover() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-[8cqw] text-center">
      <div className="absolute inset-[4.5cqw] rounded-[3px] border border-[#b08640]/40" />
      <div className="absolute inset-[6cqw] rounded-[2px] border border-[#b08640]/20" />
      <div className="text-[2.5cqw] font-medium uppercase tracking-[0.4em] text-[#a3854e]">
        Hermes Press · Demo
      </div>
      <h1 className="font-book mt-[7cqw] text-[8.6cqw] leading-[1.12] text-[#3d2f1e]">
        Vântul dintre
        <br />
        Pagini
      </h1>
      <div className="my-[5cqw] flex items-center gap-[2.4cqw]">
        <span className="h-px w-[10cqw] bg-[#b08640]/60" />
        <span className="text-[3.2cqw] leading-none text-[#b08640]">❦</span>
        <span className="h-px w-[10cqw] bg-[#b08640]/60" />
      </div>
      <p className="font-book text-[3.3cqw] italic text-[#7a6647]">
        o carte demonstrativă în trei dimensiuni
      </p>
      <p className="mt-[7cqw] text-[2.6cqw] uppercase tracking-[0.32em] text-[#9b8a6c]">
        Ioana Mărgineanu
      </p>
    </div>
  );
}

export function DemoBack() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-[8cqw] text-center">
      <div className="text-[2.4cqw] uppercase tracking-[0.4em] text-[#a3854e]">Folio · Demo</div>
      <div className="my-[5cqw] text-[3.4cqw] leading-none text-[#b08640]">❦</div>
      <p className="font-book max-w-[72cqw] text-[3.1cqw] leading-[1.7] text-[#7a6647]">
        Cartea demo s-a încheiat. Importă un PDF ca să continui lectura în aceeași bibliotecă de
        hârtie.
      </p>
      <div className="mt-[7cqw] h-px w-[16cqw] bg-[#b08640]/50" />
    </div>
  );
}

function PageFrame({
  chapter,
  title,
  page,
  children,
}: {
  chapter: string;
  title: string;
  page: number;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col px-[7cqw] pb-[4.5cqw] pt-[6.5cqw]">
      <div className="text-[2.3cqw] uppercase tracking-[0.35em] text-[#a3854e]">{chapter}</div>
      <h2 className="font-book mt-[1.8cqw] text-[5.4cqw] leading-[1.2] text-[#3d2f1e]">{title}</h2>
      <div className="mt-[3cqw] h-px w-[12cqw] bg-[#b08640]/50" />
      <div className="font-book mt-[3.6cqw] flex-1 space-y-[3.2cqw] text-[3.15cqw] leading-[1.72] text-[#5b4a32]">
        {children}
      </div>
      <div className="mt-[2cqw] text-center text-[2.4cqw] tracking-[0.3em] text-[#b3a37f]">
        — {page} —
      </div>
    </div>
  );
}

function DropCap({ children }: { children: string }) {
  return (
    <p className="overflow-hidden">
      <span className="float-left mr-[1.4cqw] font-book text-[9cqw] leading-[0.78] text-[#8a6d3f]">
        {children.charAt(0)}
      </span>
      {children.slice(1)}
    </p>
  );
}

function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-[1.5cqw] border-l-2 border-[#b08640]/50 pl-[3.2cqw] font-book text-[3.7cqw] italic leading-[1.65] text-[#7a6647]">
      {children}
    </blockquote>
  );
}

export function DemoContent({ n }: { n: number }) {
  switch (n) {
    case 0:
      return (
        <PageFrame chapter="Capitolul întâi" title="Invitația" page={1}>
          <DropCap>
            Aproape la miezul nopții, biblioteca își schimba perdelele de praf în cortine de umbră,
            iar cărțile începeau să vorbească încet, cu voci de hârtie veche.
          </DropCap>
          <p>
            Elena împinse ușa de stejar și respiră mirosul de tipar proaspăt, amestecat cu ceară
            caldă. Pe masa centrală aștepta o carte fără nume, cu coperți de piele măslinie și o
            panglică de mată legată în fund.
          </p>
          <p>
            «Cine te-a trimis?» întrebă bibliotecara, fără să ridice ochii din registru. «Vântul»,
            răspunse Elena. Și pentru prima oară de-o vară, nu simți că minte.
          </p>
        </PageFrame>
      );
    case 1:
      return (
        <PageFrame chapter="Capitolul întâi" title="Voci de hârtie" page={2}>
          <p>
            Cartea se deschise singură, ca o gaică de flori presate. Literele alergau una după alta,
            iar în marginea din dreapta cineva notase, cu creion foarte ascuțit:{" "}
            <em>citește cu voce tare, altfel nu te aude nimeni</em>.
          </p>
          <PullQuote>«O carte nu e un obiect. E o ușă care ține minte cine a trecut prin ea.»</PullQuote>
          <p>
            Din rafturi se auzea un foșnet subțire, apoi încă unul. Elena înțelese că biblioteca
            citește singură, toată noaptea, mereu începând cu ultima linie.
          </p>
        </PageFrame>
      );
    case 2:
      return (
        <PageFrame chapter="Capitolul al doilea" title="Biblioteca de la miezul nopții" page={3}>
          <DropCap>
            Rafturile se îndoaie ușor sub povara poveștilor nefinisate. Elena numără: cincisprezece
            alei, fiecare cu lampa ei și cu propriul ei păzitor de praf.
          </DropCap>
          <p>
            În a doua alea, volumele stau în picioare, ca soldații la defilare. În a șaptea,
            stivuite ca turtele de miere. În a unsprezecea lipsesc cu totul: doar un semn de carte
            atârnă pe cârlig și se leagănă.
          </p>
          <p>
            «Aici așteaptă cărțile care nu au găsit încă pe cineva să le termine», spuse
            bibliotecara. «Orașul e plin de cititori care nu ajung niciodată la ultima pagină.»
          </p>
        </PageFrame>
      );
    case 3:
      return (
        <div className="flex h-full w-full flex-col items-center justify-center px-[9cqw] text-center">
          <div className="text-[2.4cqw] uppercase tracking-[0.35em] text-[#a3854e]">
            Găsite printre pagini
          </div>
          <div className="mt-[4cqw] text-[3.4cqw] leading-none text-[#b08640]">❦</div>
          <div className="mt-[5cqw] space-y-[5.5cqw]">
            <p className="font-book text-[3.5cqw] italic leading-[1.7] text-[#5b4a32]">
              Cea mai bună bibliotecă e aceea în care te pierzi cu acte în regulă.
            </p>
            <p className="font-book text-[3.5cqw] italic leading-[1.7] text-[#5b4a32]">
              Un semn de carte e o promisiune făcută viitorului tău.
            </p>
            <p className="font-book text-[3.5cqw] italic leading-[1.7] text-[#5b4a32]">
              Cărțile nu se termină niciodată. Se odihnesc doar între două lecturi.
            </p>
          </div>
        </div>
      );
    case 4:
      return (
        <PageFrame chapter="Capitolul al treilea" title="Hârtia vie" page={5}>
          <DropCap>
            Hârtia de aici era altfel: caldă la atingere, ca o felie de pâine scoasă la timp din
            cuptor. Elena întoarse foaia și simți fibra lăsându-se în palmă, ca o pisică bătrână.
          </DropCap>
          <p>
            Sub lampă, textul respiră. Literele se întind dimineața și se strâng seara, iar
            cuvintele își caută locul, ca meșterii care își găsesc în sfârșit drumul acasă.
          </p>
          <p>
            «E hârtie vie», explică bibliotecara. «Crește numai dacă o răsfoiești. Pusă la loc pe
            raft, se usucă de dor.»
          </p>
        </PageFrame>
      );
    case 5:
      return (
        <div className="flex h-full w-full flex-col items-center justify-center px-[9cqw] text-center">
          <div className="text-[3.4cqw] leading-none text-[#b08640]">❦</div>
          <p className="font-book mt-[5cqw] text-[4.2cqw] leading-[1.6] text-[#4a3b28]">
            «Există o singură regulă în biblioteca de la miezul nopții: întoarce pagina cu grijă,
            fiindcă vântul pe care îl faci e același care întoarce viețile.»
          </p>
          <p className="mt-[5cqw] text-[2.5cqw] tracking-[0.2em] text-[#a08c66]">
            — inscripție pe peretele celei de-a treia alei
          </p>
        </div>
      );
    case 6:
      return (
        <PageFrame chapter="Capitolul al patrulea" title="Ultima întoarcere" page={7}>
          <DropCap>
            Când ajungi la ultima pagină, cartea se întoarce și începe să te citească pe tine. Tace.
            Verifică. Nu spune nimănui ce găsește.
          </DropCap>
          <p>
            Elena își aminti de bunica ei, care împătura colțurile paginilor — o erezie blândă, care
            lăsa hârtiei un traseu scurt și frumos înapoi la poveste.
          </p>
          <p>
            «Ultima întoarcere e a ta», spuse bibliotecara, întinzând cartea. «Abia atunci începe a
            doua lectură.»
          </p>
        </PageFrame>
      );
    case 7:
      return (
        <div className="flex h-full w-full flex-col items-center justify-center px-[9cqw] text-center">
          <div className="text-[3.4cqw] leading-none text-[#b08640]">❦</div>
          <h2 className="font-book mt-[3cqw] text-[6.4cqw] text-[#3d2f1e]">Sfârșitul</h2>
          <p className="font-book mt-[3.4cqw] max-w-[78cqw] text-[3.1cqw] leading-[1.75] text-[#5b4a32]">
            Mulțumesc că ai răsfoit până la capăt. Apasă «Importă PDF» în bara de sus — sau trage un
            fișier PDF direct peste fereastră — și propriile tale pagini se vor întoarce la fel de
            firesc.
          </p>
          <div className="mt-[6cqw] h-px w-[16cqw] bg-[#b08640]/50" />
          <p className="mt-[3cqw] text-[2.3cqw] uppercase tracking-[0.25em] text-[#a08c66]">
            Next.js · react-pageflip · PDF.js
          </p>
        </div>
      );
    default:
      return null;
  }
}
