export const prerender = false;
import { Client } from '@notionhq/client';

const notion = new Client({ auth: import.meta.env.NOTION_SECRET });
const DATABASE_ID = import.meta.env.NOTION_DATABASE_ID; 

export async function POST({ request }) {
  try {
    const data = await request.json();
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const email = typeof data.email === 'string' ? data.email.trim() : '';
    const resumeUrl = typeof data.resume === 'string' ? data.resume.trim() : '';
    const role = typeof data.role === 'string' ? data.role.trim() : '';
    const experience = typeof data.experience === 'string' ? data.experience.trim() : '';
    let linkedin = typeof data.linkedin === 'string' ? data.linkedin.trim() : '';

    if (!name) {
      return new Response(JSON.stringify({ error: 'Full Name is required' }), { status: 400 });
    }

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email Address is required' }), { status: 400 });
    }

    if (!resumeUrl) {
      return new Response(JSON.stringify({ error: 'Resume URL is required' }), { status: 400 });
    }

    if (linkedin && !linkedin.startsWith('http://') && !linkedin.startsWith('https://')) {
      linkedin = `https://${linkedin}`;
    }

    const properties = {
      "Name": { 
        title: [{ text: { content: name } }] 
      },
      "Email": { 
        email: email 
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
    };

    if (role) {
      properties["Role"] = { select: { name: role } };
    }

    if (experience) {
      properties["Total Work Experience"] = { select: { name: experience } };
    }

    if (linkedin) {
      properties["LinkedIn"] = { url: linkedin };
    }

    await notion.pages.create({
      parent: { 
        database_id: DATABASE_ID
      },
      properties: properties,
    });

    return new Response(JSON.stringify({ message: "Success" }), { status: 200 });
    
  } catch (error) {
    console.error("----------------------------------");
    console.error("🚨 NOTION SUBMIT REJECTED:");
    console.error(error?.body || error?.message || error);
    console.error("----------------------------------");
    
    return new Response(
      JSON.stringify({ error: error?.message || 'Failed to record application in Notion' }), 
      { status: 500 }
    );
  }
}