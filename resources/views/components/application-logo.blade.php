@props(['class' => ''])

<img
    src="{{ asset('logo.png') }}"
    alt="SIBULAN Logo"
    class="{{ $class }}"
    onerror="this.src='{{ asset('logo.svg') }}'; this.onerror=function(){this.src='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'};"
/>