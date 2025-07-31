import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, InputTextModule],
  template: `
  <!-- Footer -->
  <footer class="bg-gray-900 text-white py-12">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-4 gap-8">
        <div>
          <div class="flex items-center space-x-2 mb-4">
            <div class="w-6 h-6 bg-blue-600 rounded"></div>
            <span class="text-xl font-bold">Planet</span>
          </div>
          <p class="text-gray-400 text-sm mb-4">Your trusted online store & shop for all your needs.</p>
          <div class="space-y-2 text-sm text-gray-400">
            <div>📧 'info-planet.com'</div>
            <div>📞 +1 234 567 890</div>
            <div>📍 123 Street, City, Country</div>
          </div>
        </div>
        <div>
          <h4 class="font-semibold mb-4">My Account</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li><a href="#" class="hover:text-white transition-colors">My Profile</a></li>
            <li><a href="#" class="hover:text-white transition-colors">My Order History</a></li>
            <li><a href="#" class="hover:text-white transition-colors">My Wish List</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Order Tracking</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Shopping Cart</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Shop Departments</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li><a href="#" class="hover:text-white transition-colors">Computers & Accessories</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Smartphones & Tablets</a></li>
            <li><a href="#" class="hover:text-white transition-colors">TV, Video & Audio</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Cameras, Photo & Video</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Headphones</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Download App</h4>
          <div class="space-y-3">
            <div
              class="flex items-center space-x-2 bg-gray-800 rounded-lg p-2 cursor-pointer hover:bg-gray-700 transition-colors">
              <div class="text-2xl">📱</div>
              <div>
                <div class="text-xs text-gray-400">Get it on</div>
                <div class="font-semibold">Google Play</div>
              </div>
            </div>
            <div
              class="flex items-center space-x-2 bg-gray-800 rounded-lg p-2 cursor-pointer hover:bg-gray-700 transition-colors">
              <div class="text-2xl">🍎</div>
              <div>
                <div class="text-xs text-gray-400">Download on the</div>
                <div class="font-semibold">App Store</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-400 text-sm">© 2024 Planet. All rights reserved.</p>
        <div class="flex space-x-4 mt-4 md:mt-0">
          <div class="text-2xl cursor-pointer hover:scale-110 transition-transform">💳</div>
          <div class="text-2xl cursor-pointer hover:scale-110 transition-transform">💳</div>
          <div class="text-2xl cursor-pointer hover:scale-110 transition-transform">💳</div>
          <div class="text-2xl cursor-pointer hover:scale-110 transition-transform">💳</div>
        </div>
      </div>
    </div>
  </footer>
  `,
  styles: [`
    footer {
      margin-top: 2rem;
    }
    
    @media (max-width: 768px) {
      .col-6 {
        margin-bottom: 1.5rem;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
