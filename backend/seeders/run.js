require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Field, FieldUpdate } = require('../src/models');

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function dateOnly(d) {
  return d.toISOString().slice(0, 10);
}

async function run() {
  await sequelize.authenticate();
  console.log('Syncing schema (force:true — drops and recreates tables)...');
  await sequelize.sync({ force: true });

  console.log('Creating users...');
  const adminPw = await bcrypt.hash('Admin1234', 10);
  const agentPw = await bcrypt.hash('Agent1234', 10);

  const admin = await User.create({
    name: 'James Mwangi',
    email: 'admin@smartseason.com',
    password: adminPw,
    role: 'admin'
  });

  const aisha = await User.create({
    name: 'Aisha Odhiambo',
    email: 'aisha@smartseason.com',
    password: agentPw,
    role: 'agent'
  });

  const brian = await User.create({
    name: 'Brian Kipchoge',
    email: 'brian@smartseason.com',
    password: agentPw,
    role: 'agent'
  });

  console.log('Creating fields with update histories...');

  const scenarios = [
    {
      field: {
        name: 'Eldoret East — Maize Block',
        crop_type: 'maize',
        planting_date: dateOnly(daysAgo(90)),
        current_stage: 'ready',
        assigned_agent_id: aisha.id,
        notes: 'Hybrid H614D. Drip irrigation installed.'
      },
      updates: [
        { days: 85, stage: 'planted', observation: 'Germination excellent across all rows.', agent: aisha.id },
        { days: 60, stage: 'growing', observation: 'Knee height. Top dressing done with CAN.', agent: aisha.id },
        { days: 25, stage: 'growing', observation: 'Tasseling. Some fall armyworm spotted on north edge.', agent: aisha.id },
        { days: 5, stage: 'ready', observation: 'Cobs filling out well. Ready for harvest in ~2 weeks.', agent: aisha.id }
      ]
    },
    {
      field: {
        name: 'Nakuru Central Plot B',
        crop_type: 'wheat',
        planting_date: dateOnly(daysAgo(60)),
        current_stage: 'growing',
        assigned_agent_id: brian.id,
        notes: 'Variety Kenya Simba. Rainfed.'
      },
      updates: [
        { days: 55, stage: 'planted', observation: 'Sowing completed over 3 days.', agent: brian.id },
        { days: 30, stage: 'growing', observation: 'Uniform tillering observed.', agent: brian.id },
        { days: 3, stage: 'growing', observation: 'No disease pressure. Rainfall adequate.', agent: brian.id }
      ]
    },
    {
      field: {
        name: 'Kisumu Riverside Farm',
        crop_type: 'rice',
        planting_date: dateOnly(daysAgo(30)),
        current_stage: 'growing',
        assigned_agent_id: aisha.id,
        notes: 'Paddy system. Water levels monitored weekly.'
      },
      updates: [
        { days: 28, stage: 'planted', observation: 'Transplanted 21-day seedlings.', agent: aisha.id },
        { days: 10, stage: 'growing', observation: 'Strong tillering. No snail damage.', agent: aisha.id },
        { days: 2, stage: 'growing', observation: 'Applied second top dressing.', agent: aisha.id }
      ]
    },
    {
      field: {
        name: 'Meru Highland Tea',
        crop_type: 'tea',
        planting_date: dateOnly(daysAgo(110)),
        current_stage: 'ready',
        assigned_agent_id: brian.id,
        notes: 'Established block. Plucking ongoing.'
      },
      updates: [
        { days: 100, stage: 'planted', observation: 'New infill clones established in gap areas.', agent: brian.id },
        { days: 40, stage: 'growing', observation: 'Pruning cycle complete. Fresh flush emerging.', agent: brian.id },
        { days: 7, stage: 'ready', observation: 'Good two-leaf-and-a-bud shoot density.', agent: brian.id }
      ]
    },
    {
      field: {
        name: 'Thika Road Beans Farm',
        crop_type: 'beans',
        planting_date: dateOnly(daysAgo(125)),
        current_stage: 'growing',
        assigned_agent_id: aisha.id,
        notes: 'Variety KAT B1. Past typical harvest window.'
      },
      updates: [
        { days: 120, stage: 'planted', observation: 'Planting delayed by wet soil.', agent: aisha.id },
        { days: 70, stage: 'growing', observation: 'Pod formation underway.', agent: aisha.id },
        { days: 4, stage: 'growing', observation: 'Aphid treatment applied. Maturity seems stalled.', agent: aisha.id }
      ]
    },
    {
      field: {
        name: 'Nyeri North Maize',
        crop_type: 'maize',
        planting_date: dateOnly(daysAgo(45)),
        current_stage: 'planted',
        assigned_agent_id: brian.id,
        notes: 'No follow-up updates logged yet.'
      },
      updates: []
    },
    {
      field: {
        name: 'Kitale Sunflower',
        crop_type: 'sunflower',
        planting_date: dateOnly(daysAgo(140)),
        current_stage: 'harvested',
        assigned_agent_id: aisha.id,
        notes: 'Yields above expectation. Delivered to aggregator.'
      },
      updates: [
        { days: 135, stage: 'planted', observation: 'Planting done with tractor-drawn planter.', agent: aisha.id },
        { days: 90, stage: 'growing', observation: 'Flowering stage healthy.', agent: aisha.id },
        { days: 40, stage: 'ready', observation: 'Heads drying down, moisture on target.', agent: aisha.id },
        { days: 10, stage: 'harvested', observation: 'Harvest complete. 1.4 tonnes/acre.', agent: aisha.id }
      ]
    },
    {
      field: {
        name: 'Narok Wheat Field',
        crop_type: 'wheat',
        planting_date: dateOnly(daysAgo(80)),
        current_stage: 'growing',
        assigned_agent_id: brian.id,
        notes: 'Large-scale block. Monitored by scout team.'
      },
      updates: [
        { days: 75, stage: 'planted', observation: 'Seed drill at 120kg/ha.', agent: brian.id },
        { days: 50, stage: 'growing', observation: 'Good canopy closure.', agent: brian.id },
        { days: 6, stage: 'growing', observation: 'Booting starting. No rust detected.', agent: brian.id }
      ]
    },
    {
      field: {
        name: 'Embu River Plot',
        crop_type: 'vegetables',
        planting_date: dateOnly(daysAgo(20)),
        current_stage: 'planted',
        assigned_agent_id: aisha.id,
        notes: 'Kale, spinach, and managu intercropped.'
      },
      updates: [
        { days: 18, stage: 'planted', observation: 'Seedlings transplanted from nursery.', agent: aisha.id },
        { days: 3, stage: 'planted', observation: 'Irrigation schedule working well.', agent: aisha.id }
      ]
    },
    {
      field: {
        name: 'Bungoma East Farm',
        crop_type: 'maize',
        planting_date: dateOnly(daysAgo(100)),
        current_stage: 'ready',
        assigned_agent_id: brian.id,
        notes: 'DK8031. Short-season variety.'
      },
      updates: [
        { days: 95, stage: 'planted', observation: 'Planted on the first rains.', agent: brian.id },
        { days: 55, stage: 'growing', observation: 'Strong growth. Minor lodging in one corner.', agent: brian.id },
        { days: 8, stage: 'ready', observation: 'Dent stage reached. Drying down starting.', agent: brian.id }
      ]
    }
  ];

  for (const s of scenarios) {
    const field = await Field.create({
      ...s.field,
      created_by: admin.id
    });

    for (const u of s.updates) {
      const record = await FieldUpdate.create({
        field_id: field.id,
        agent_id: u.agent,
        new_stage: u.stage,
        observation: u.observation
      });
      await sequelize.query(
        'UPDATE field_updates SET created_at = :ts WHERE id = :id',
        { replacements: { ts: daysAgo(u.days).toISOString(), id: record.id } }
      );
    }
  }

  console.log('\nSeed complete!');
  console.log('\nDemo credentials:');
  console.log('  Admin: admin@smartseason.com / Admin1234');
  console.log('  Agent: aisha@smartseason.com / Agent1234');
  console.log('  Agent: brian@smartseason.com / Agent1234\n');
  await sequelize.close();
}

run().catch((err) => {
  console.error('Seeder failed:', err);
  process.exit(1);
});
