// @ts-ignore: Underlying module exports lack explicit typings in this React-Start version
import { createAPIFileRoute } from '@tanstack/react-start/api';
import fs from 'fs';
import path from 'path';

export const APIRoute = createAPIFileRoute('/api/data_stream')({
    POST: async ({ request }: { request: Request }) => {
        try {
            const data = await request.json();

            // Store in a simple JSON file in public folder for easy prototyping access
            const dbPath = path.join(process.cwd(), 'public', 'data_stream.json');

            let store = [];
            if (fs.existsSync(dbPath)) {
                try {
                    store = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                } catch (e) {
                    store = [];
                }
            }

            // Enforce schema typing to match PotholeIncident frontend schema exactly
            store.unshift({
                id: Date.now(),
                h3_index: data.location?.h3_index || "",
                latitude: data.location?.latitude || 0,
                longitude: data.location?.longitude || 0,
                confidence: data.pothole?.confidence || 0,
                report_count: 1
            });

            // Keep only last 100 events to prevent file bloat
            if (store.length > 100) store.pop();
            fs.writeFileSync(dbPath, JSON.stringify(store, null, 2));

            console.log('\n✅ Received Pothole DataStream');
            console.log(`Coords: ${data.location?.latitude}, ${data.location?.longitude}`);
            console.log(`Confidence: ${data.pothole?.confidence}`);

            return new Response(JSON.stringify({ status: 'delivered', message: 'DataStream saved to public DB' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (err) {
            console.error("DataStream Endpoint Error:", err);
            return new Response(JSON.stringify({ error: "Invalid Payload structure" }), { status: 400 });
        }
    },
});
