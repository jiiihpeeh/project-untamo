use iced::{widget::Svg, Color, Element, Length};
use iced::widget::svg::Handle;
use crate::messages::Message;

#[derive(Clone, Copy)]
pub enum Icon {
    Pencil,
    Trash2,
    Plus,
    ChevronDown,
    ChevronUp,
    Play,
    Square,
    Globe,
    Monitor,
    Smartphone,
    Tablet,
    Cpu,
    LayoutGrid,
    RefreshCw,
    QrCode,
}

fn icon_inner(icon: Icon) -> &'static str {
    match icon {
        Icon::Pencil => r#"<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>"#,
        Icon::Trash2 => r#"<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>"#,
        Icon::Plus => r#"<path d="M5 12h14"/><path d="M12 5v14"/>"#,
        Icon::ChevronDown => r#"<path d="m6 9 6 6 6-6"/>"#,
        Icon::ChevronUp => r#"<path d="m18 15-6-6-6 6"/>"#,
        Icon::Play => r#"<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/>"#,
        Icon::Square => r#"<rect width="18" height="18" x="3" y="3" rx="2"/>"#,
        Icon::Globe => r#"<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>"#,
        Icon::Monitor => r#"<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>"#,
        Icon::Smartphone => r#"<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>"#,
        Icon::Tablet => r#"<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/>"#,
        Icon::Cpu => r#"<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="8" width="8" height="8" rx="1"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M7 2v2"/><path d="M7 20v2"/><path d="M17 2v2"/><path d="M17 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M2 7h2"/><path d="M20 7h2"/><path d="M2 17h2"/><path d="M20 17h2"/>"#,
        Icon::LayoutGrid => r#"<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>"#,
        Icon::RefreshCw => r#"<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>"#,
        Icon::QrCode => r#"<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>"#,
    }
}

/// Returns an iced Svg widget for the given icon, rendered with the given stroke color.
pub fn icon_svg(icon: Icon, color: Color, size: f32) -> Svg<'static> {
    let r = (color.r * 255.0).round() as u8;
    let g = (color.g * 255.0).round() as u8;
    let b = (color.b * 255.0).round() as u8;
    let color_str = format!("#{:02X}{:02X}{:02X}", r, g, b);
    let inner = icon_inner(icon);
    let svg_str = format!(
        r#"<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{inner}</svg>"#,
        color = color_str,
        inner = inner,
    );
    Svg::new(Handle::from_memory(svg_str.into_bytes()))
        .width(Length::Fixed(size))
        .height(Length::Fixed(size))
}

/// Convenience: icon as an Element
pub fn icon_el<'a>(icon: Icon, color: Color, size: f32) -> Element<'a, Message> {
    icon_svg(icon, color, size).into()
}
