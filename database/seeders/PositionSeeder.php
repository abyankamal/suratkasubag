<?php

namespace Database\Seeders;

use App\Models\Position;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    public function run(): void
    {
        $positions = [
            // Management
            ['name' => 'Kasubag Umum'],
            ['name' => 'Kasubag Keuangan'],
            ['name' => 'Kasubag SDM'],
            ['name' => 'Kasubag IT'],
            ['name' => 'Kasubag Pemasaran'],
            ['name' => 'Kasubag Operasional'],
            ['name' => 'Kasubag Hukum'],
            ['name' => 'Kasubag Pengadaan'],
        ];

        foreach ($positions as $position) {
            Position::create($position);
        }

        $this->command->info('Seeded positions successfully');
    }
}
