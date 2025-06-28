<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Administrator',
            'username' => 'admin',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'department_id' => 1,
            'position_id' => 1
        ]);

        // Create regular user
        User::create([
            'name' => 'Regular User',
            'username' => 'user',
            'password' => Hash::make('user123'),
            'role' => 'user',
            'department_id' => 1,
            'position_id' => 1
        ]);

        $this->command->info('Seeded users: admin and regular user accounts created successfully');
    }
}
