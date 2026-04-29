import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL     = "https://skwkjawndhppzamvfuza.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrd2tqYXduZGhwcHphbXZmdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk1MzQ2OCwiZXhwIjoyMDkyNTI5NDY4fQ.sfYrZbQuWyg_kGZWULv3ak22MKR0Wlm_C4s6isH0n_M";
const AVATARS_DIR      = "/Users/lucaswein/Downloads/Avatars";
const PASSWORD         = "123123123";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── User list ─────────────────────────────────────────────────────────────────
// First 10 → broker, rest → buyer (client)
// name derived from filename; email = firstname@test.com
const USERS = [
  // ── BROKERS (10) ──────────────────────────────────────────────────────────
  { file: "Abigail Atlanta.png",    fullName: "Abigail Atlanta",    email: "abigail@test.com"    },
  { file: "Alexander Anderson.png", fullName: "Alexander Anderson", email: "alexander@test.com"  },
  { file: "Amelia Austin.png",      fullName: "Amelia Austin",      email: "amelia@test.com"     },
  { file: "Andrew Atlanta.png",     fullName: "Andrew Atlanta",     email: "andrew@test.com"     },
  { file: "Anthony Austin.png",     fullName: "Anthony Austin",     email: "anthony@test.com"    },
  { file: "Ava Anderson.png",       fullName: "Ava Anderson",       email: "ava@test.com"        },
  { file: "Bella Boston.png",       fullName: "Bella Boston",       email: "bella@test.com"      },
  { file: "Benjamin Boston.png",    fullName: "Benjamin Boston",    email: "benjamin@test.com"   },
  { file: "Charlotte Cambridge.png",fullName: "Charlotte Cambridge",email: "charlotte@test.com"  },
  { file: "Chloe Charleston.png",   fullName: "Chloe Charleston",   email: "chloe@test.com"      },
  // ── CLIENTS (41) ─────────────────────────────────────────────────────────
  { file: "Christopher Cambridge.png", fullName: "Christopher Cambridge", email: "christopher@test.com" },
  { file: "Daniel Dublin.png",      fullName: "Daniel Dublin",      email: "daniel@test.com"     },
  { file: "David Denver.png",       fullName: "David Denver",       email: "david@test.com"      },
  { file: "Emily Edinburgh.png",    fullName: "Emily Edinburgh",    email: "emily@test.com"      },
  { file: "Emma Everest.png",       fullName: "Emma Everest",       email: "emma@test.com"       },
  { file: "Ethan Everest.png",      fullName: "Ethan Everest",      email: "ethan@test.com"      },
  { file: "Grace Geneva.png",       fullName: "Grace Geneva",       email: "grace@test.com"      },
  { file: "Harper Hudson.png",      fullName: "Harper Hudson",      email: "harper@test.com"     },
  { file: "Henry Hudson.png",       fullName: "Henry Hudson",       email: "henry@test.com"      },
  { file: "Isabella Ireland.png",   fullName: "Isabella Ireland",   email: "isabella@test.com"   },
  { file: "Jacob Jamaica.png",      fullName: "Jacob Jamaica",      email: "jacob@test.com"      },
  { file: "James Jefferson.png",    fullName: "James Jefferson",    email: "james@test.com"      },
  { file: "Joseph Jordan.png",      fullName: "Joseph Jordan",      email: "joseph@test.com"     },
  { file: "Liam Lancaster.png",     fullName: "Liam Lancaster",     email: "liam@test.com"       },
  { file: "Lily London.png",        fullName: "Lily London",        email: "lily@test.com"       },
  { file: "Matthew Madison.png",    fullName: "Matthew Madison",    email: "matthew@test.com"    },
  { file: "Mia Madison.png",        fullName: "Mia Madison",        email: "mia@test.com"        },
  { file: "Michael Monaco.png",     fullName: "Michael Monaco",     email: "michael@test.com"    },
  { file: "Natalie Norway.png",     fullName: "Natalie Norway",     email: "natalie@test.com"    },
  { file: "Nicholas Norway.png",    fullName: "Nicholas Norway",    email: "nicholas@test.com"   },
  { file: "Noah Nashville.png",     fullName: "Noah Nashville",     email: "noah@test.com"       },
  { file: "Olivia Orlando.png",     fullName: "Olivia Orlando",     email: "olivia@test.com"     },
  { file: "Ryan Raleigh.png",       fullName: "Ryan Raleigh",       email: "ryan@test.com"       },
  { file: "Samuel Sydney.png",      fullName: "Samuel Sydney",      email: "samuel@test.com"     },
  { file: "Scarlett Sydney.png",    fullName: "Scarlett Sydney",    email: "scarlett@test.com"   },
  { file: "Sophia Sydney.png",      fullName: "Sophia Sydney",      email: "sophia@test.com"     },
  { file: "Stella Seattle.png",     fullName: "Stella Seattle",     email: "stella@test.com"     },
  { file: "Victoria Vienna.png",    fullName: "Victoria Vienna",    email: "victoria@test.com"   },
  { file: "William Washington.png", fullName: "William Washington", email: "william@test.com"    },
  { file: "Zoey Zurich.png",        fullName: "Zoey Zurich",        email: "zoey@test.com"       },
  { file: "andreaamerica.png",      fullName: "Andrea America",     email: "andrea@test.com"     },
  { file: "beabenito.png",          fullName: "Bea Benito",         email: "bea@test.com"        },
  { file: "charlicorbusier.png",    fullName: "Charli Corbusier",   email: "charli@test.com"     },
  { file: "dannydorne.png",         fullName: "Danny Dorne",        email: "danny@test.com"      },
  { file: "evaeugene.png",          fullName: "Eva Eugene",         email: "eva@test.com"        },
  { file: "francisfarmer.png",      fullName: "Francis Farmer",     email: "francis@test.com"    },
  { file: "gusgrim.png",            fullName: "Gus Grim",           email: "gus@test.com"        },
  { file: "harryhorns.png",         fullName: "Harry Horns",        email: "harry@test.com"      },
  { file: "iolandainiesta.png",     fullName: "Iolanda Iniesta",    email: "iolanda@test.com"    },
  { file: "joejordi.png",           fullName: "Joe Jordi",          email: "joe@test.com"        },
  { file: "milenamaria.png",        fullName: "Milena Maria",       email: "milena@test.com"     },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

async function ensureBucket() {
  await admin.storage.createBucket("avatars", {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });
  // ignore "already exists" error
}

async function seedUser(user, role, index) {
  process.stdout.write(`[${String(index + 1).padStart(2, "0")}] ${user.fullName} (${role}) … `);

  // 1. Create auth user
  const { data, error: createErr } = await admin.auth.admin.createUser({
    email: user.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: user.fullName },
  });

  if (createErr) {
    console.log(`SKIP — ${createErr.message}`);
    return;
  }

  const userId = data.user.id;

  // 2. Update profile (trigger creates it with role=buyer; update role + name)
  await admin
    .from("profiles")
    .update({ role, full_name: user.fullName })
    .eq("id", userId);

  // 3. Upload avatar
  const filePath = path.join(AVATARS_DIR, user.file);
  const buffer   = fs.readFileSync(filePath);
  const blob     = new Blob([buffer], { type: "image/png" });

  const { error: uploadErr } = await admin.storage
    .from("avatars")
    .upload(userId, blob, { upsert: true, contentType: "image/png", cacheControl: "3600" });

  if (uploadErr) {
    console.log(`created but avatar failed — ${uploadErr.message}`);
    return;
  }

  // 4. Save public URL to profile
  const { data: { publicUrl } } = admin.storage.from("avatars").getPublicUrl(userId);
  await admin.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);

  console.log("✓");
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log(`Seeding ${USERS.length} users (10 brokers, ${USERS.length - 10} clients)…\n`);

await ensureBucket();

for (let i = 0; i < USERS.length; i++) {
  const role = i < 10 ? "broker" : "buyer";
  await seedUser(USERS[i], role, i);
}

console.log("\nDone.");
