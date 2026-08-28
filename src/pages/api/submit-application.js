export const prerender = false;
import { Client } from '@notionhq/client';

const notion = new Client({ auth: import.meta.env.NOTION_SECRET });

const DATABASE_ID = import.meta.env.NOTION_DATABASE_ID; 

export async function POST({ request }) {
  const data = await request.json();
  const resumeUrl = typeof data.resume === 'string' ? data.resume.trim() : '';

  try {
    if (!resumeUrl) {
      return new Response(JSON.stringify({ error: 'Missing resume URL' }), { status: 400 });
    }

    await notion.pages.create({
      parent: { 
        database_id: DATABASE_ID
      },
      properties: {
        "Name": { 
          title: [{ text: { content: data.name } }] 
        },
        "Email": { 
          email: data.email 
        },
        "Role": { 
          select: { name: data.role } 
        },
        "Total Work Experience": { 
          select: { name: data.experience } 
        },
        // Make sure the capitalization matches your Notion column exactly!
        "LinkedIn": { 
          url: data.linkedin 
        },
        "Upload CV": { 
          files: [
            {
              name: data.resumeFilename || "Resume",
              type: "external",
              external: { url: resumeUrl }
            }
          ]
        }
      },
    });

    return new Response(JSON.stringify({ message: "Success" }), { status: 200 });
    
  } catch (error) {
    // 🚨 THE BACKEND X-RAY
    // This will print the EXACT reason Notion rejected the data to your terminal
    console.error("----------------------------------");
    console.error("🚨 NOTION SUBMIT REJECTED:");
    console.error(error.body || error.message);
    console.error("----------------------------------");
    
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}