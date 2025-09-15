<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CompanyIntro;
use Illuminate\Support\Facades\Log;

class UpdateCompanyIntroImageUrls extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-company-intro-image-urls';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Updates old Node.js image URLs in the company_intro table to Laravel public paths.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting update of company_intro image URLs...');

        $intros = CompanyIntro::all();

        foreach ($intros as $intro) {
            $originalImages = $intro->images; // Laravel casts it to an array automatically
            $updatedImages = [];
            $changesMade = false;

            if (is_array($originalImages)) {
                foreach ($originalImages as $imageUrl) {
                    $newUrl = $imageUrl;
                    // Check for old Node.js URL
                    if (str_starts_with($imageUrl, 'http://localhost:5000/uploads/')) {
                        // Keep only the 'uploads/' part and the filename
                        $newUrl = str_replace('http://localhost:5000/', '', $imageUrl);
                        $changesMade = true;
                    } elseif (str_starts_with($imageUrl, 'C:\\Users\\Lenovo\\one-stop-company\\server\\uploads\\')) {
                        // Handle Windows paths
                        $newUrl = str_replace('C:\\Users\\Lenovo\\one-stop-company\\server\\', '', $imageUrl);
                        $newUrl = str_replace('\\', '/', $newUrl); // Normalize backslashes to forward slashes
                        $changesMade = true;
                    }
                    $updatedImages[] = $newUrl;
                }
            } else {
                Log::warning("Images column for CompanyIntro ID: {$intro->id} is not an array. Value: " . json_encode($originalImages));
                $this->warn("Images column for CompanyIntro ID: {$intro->id} is not an array. Skipping.");
                continue;
            }

            if ($changesMade) {
                $intro->images = $updatedImages; // Assign the array directly
                $intro->save();
                $this->info("Updated image URLs for CompanyIntro ID: {$intro->id}");
            } else {
                $this->line("No changes needed for CompanyIntro ID: {$intro->id}");
            }
        }

        $this->info('Image URL update process completed.');
        return Command::SUCCESS;
    }
}