use crate::audio;
use crate::messages::Message;
use crate::state::{Alarm, AppState, DeviceSelect};
use crate::theme::{primary_button, secondary_button, COLORS};
use chrono::{Datelike, Duration, Local, NaiveDateTime, NaiveTime};
use iced::widget::canvas::{self, Canvas, Frame, Geometry, Path};
use iced::widget::{button, column, container, row, text};
use iced::{Border, Color, Element, Length, Point, Rectangle, Shadow, Vector};
use iced_widget::rule;

// ── Constants ─────────────────────────────────────────────────────────────────

pub const POP_WIDTH: f32 = 264.0;
pub const TAIL_H: f32 = 11.0;
const TAIL_W: f32 = 20.0;
// Rough x-center of the "Alarms" button within the popup canvas (left-biased).
const TAIL_X: f32 = POP_WIDTH * 0.32;

// ── Helpers ───────────────────────────────────────────────────────────────────

fn seconds_to_next(alarm: &Alarm) -> Option<i64> {
    if alarm.time.len() < 2 || !alarm.active {
        return None;
    }
    let h = alarm.time[0] as u32;
    let m = alarm.time[1] as u32;
    let alarm_time = NaiveTime::from_hms_opt(h, m, 0)?;
    let now = Local::now().naive_local();
    let today = now.date();

    let next: NaiveDateTime = match alarm.occurrence.to_lowercase().as_str() {
        "once" => {
            if alarm.date.len() < 3 {
                return None;
            }
            chrono::NaiveDate::from_ymd_opt(
                alarm.date[0] as i32,
                alarm.date[1] as u32,
                alarm.date[2] as u32,
            )?
            .and_time(alarm_time)
        }
        "daily" => {
            let c = today.and_time(alarm_time);
            if c > now {
                c
            } else {
                (today + Duration::days(1)).and_time(alarm_time)
            }
        }
        "weekly" => {
            let weekdays: Vec<u32> = (0..7u32)
                .filter(|i| alarm.weekdays & (1 << i) != 0)
                .collect();
            if weekdays.is_empty() {
                return None;
            }
            let today_wd = today.weekday().num_days_from_monday();
            let mut best: Option<NaiveDateTime> = None;
            for &bit in &weekdays {
                let mut diff = bit as i64 - today_wd as i64;
                if diff < 0 {
                    diff += 7;
                }
                let c = (today + Duration::days(diff)).and_time(alarm_time);
                let c = if c <= now { c + Duration::days(7) } else { c };
                best = Some(best.map_or(c, |b: NaiveDateTime| b.min(c)));
            }
            best?
        }
        "yearly" => {
            if alarm.date.len() < 3 {
                return None;
            }
            let year = today.year();
            let this_year = chrono::NaiveDate::from_ymd_opt(
                year,
                alarm.date[1] as u32,
                alarm.date[2] as u32,
            )?
            .and_time(alarm_time);
            if this_year > now {
                this_year
            } else {
                chrono::NaiveDate::from_ymd_opt(
                    year + 1,
                    alarm.date[1] as u32,
                    alarm.date[2] as u32,
                )?
                .and_time(alarm_time)
            }
        }
        _ => return None,
    };

    let secs = (next - now).num_seconds();
    if secs < 0 {
        None
    } else {
        Some(secs)
    }
}

fn find_next_alarm<'a>(alarms: &'a [Alarm], device_id: Option<&str>) -> Option<(&'a Alarm, i64)> {
    alarms
        .iter()
        .filter_map(|a| seconds_to_next(a).map(|s| (a, s)))
        .filter(|(a, _)| {
            device_id
                .map(|id| a.devices.iter().any(|d| d == id))
                .unwrap_or(true)
        })
        .min_by_key(|(_, s)| *s)
}

fn format_countdown(secs: i64) -> String {
    let d = secs / 86400;
    let h = (secs % 86400) / 3600;
    let m = (secs % 3600) / 60;
    let s = secs % 60;
    if d > 0 {
        format!("{}d {:02}:{:02}", d, h, m)
    } else {
        format!("{:02}:{:02}:{:02}", h, m, s)
    }
}

// ── Bubble tail canvas ────────────────────────────────────────────────────────

struct BubbleTail {
    fill: Color,
    stroke: Color,
    /// true = tip points up (for top navbar); false = tip points down (for bottom navbar)
    tip_up: bool,
}

impl<Msg> canvas::Program<Msg> for BubbleTail {
    type State = ();

    fn draw(
        &self,
        _state: &(),
        renderer: &iced::Renderer,
        _theme: &iced::Theme,
        bounds: Rectangle,
        _cursor: iced::mouse::Cursor,
    ) -> Vec<Geometry<iced::Renderer>> {
        let mut frame = Frame::new(renderer, bounds.size());
        let h = bounds.height;

        if self.tip_up {
            // Tip at top (y=0), base at bottom (y=h)
            let border = Path::new(|b| {
                b.move_to(Point::new(TAIL_X, 0.0));
                b.line_to(Point::new(TAIL_X - TAIL_W / 2.0 - 1.0, h));
                b.line_to(Point::new(TAIL_X + TAIL_W / 2.0 + 1.0, h));
                b.close();
            });
            frame.fill(&border, self.stroke);
            let fill = Path::new(|b| {
                b.move_to(Point::new(TAIL_X, 1.0));
                b.line_to(Point::new(TAIL_X - TAIL_W / 2.0, h));
                b.line_to(Point::new(TAIL_X + TAIL_W / 2.0, h));
                b.close();
            });
            frame.fill(&fill, self.fill);
        } else {
            // Tip at bottom (y=h), base at top (y=0)
            let border = Path::new(|b| {
                b.move_to(Point::new(TAIL_X - TAIL_W / 2.0 - 1.0, 0.0));
                b.line_to(Point::new(TAIL_X + TAIL_W / 2.0 + 1.0, 0.0));
                b.line_to(Point::new(TAIL_X, h));
                b.close();
            });
            frame.fill(&border, self.stroke);
            let fill = Path::new(|b| {
                b.move_to(Point::new(TAIL_X - TAIL_W / 2.0, 0.0));
                b.line_to(Point::new(TAIL_X + TAIL_W / 2.0, 0.0));
                b.line_to(Point::new(TAIL_X, h - 1.0));
                b.close();
            });
            frame.fill(&fill, self.fill);
        }

        vec![frame.into_geometry()]
    }
}

// ── Divider helper ────────────────────────────────────────────────────────────

fn divider<'a>() -> Element<'a, Message> {
    rule::horizontal(1)
        .style(|_| iced_widget::rule::Style {
            color: COLORS.border,
            radius: 0.0.into(),
            fill_mode: iced_widget::rule::FillMode::Full,
            snap: false,
        })
        .into()
}

// ── Public view ───────────────────────────────────────────────────────────────

/// `nav_top`: true when the navbar is at the top of the screen.
pub fn alarm_pop_view<'a>(state: &'a AppState, nav_top: bool) -> Element<'a, Message> {
    let device_id: Option<String> = match &state.welcome.selected_device {
        DeviceSelect::Device(d) => Some(d.id.clone()),
        DeviceSelect::None => None,
    };
    let device_name = match &state.welcome.selected_device {
        DeviceSelect::Device(d) => d.device_name.clone(),
        DeviceSelect::None => "—".to_string(),
    };
    let screen_name = state
        .login
        .user_info
        .as_ref()
        .map(|u| u.screen_name.clone())
        .unwrap_or_default();

    let next = find_next_alarm(&state.alarms, device_id.as_deref());

    // ── Build card sections ───────────────────────────────────────────────────

    let mut sections: Vec<Element<Message>> = Vec::new();

    // Header
    sections.push(
        container(
            text(format!("Alarms for {} on {}", screen_name, device_name))
                .size(12)
                .color(COLORS.text),
        )
        .padding([10, 14])
        .width(Length::Fill)
        .into(),
    );
    sections.push(divider());

    // Body — next alarm info (only when one exists for this device)
    if let Some((alarm, _)) = next {
        let h = alarm.time.first().copied().unwrap_or(0);
        let m = alarm.time.get(1).copied().unwrap_or(0);
        let time_str = if state.settings.clock24 {
            format!("{:02}:{:02}", h, m)
        } else {
            let is_pm = h >= 12;
            let h12 = if h == 0 { 12 } else if h > 12 { h - 12 } else { h };
            format!("{:02}:{:02} {}", h12, m, if is_pm { "PM" } else { "AM" })
        };

        let mut actions = row![button(text("Edit Alarm").size(12))
            .on_press(Message::EditAlarm(alarm.id.clone()))
            .style(primary_button()),]
        .spacing(6);

        if !alarm.snooze.is_empty() {
            actions = actions.push(
                button(text("Reset Snooze").size(12))
                    .on_press(Message::ResetSnooze(alarm.id.clone()))
                    .style(secondary_button()),
            );
        }

        let mut body_col = column![
            text(format!("Coming Up: {}", time_str))
                .size(13)
                .color(COLORS.text),
            actions,
        ]
        .spacing(8);

        if audio::is_audio_playing() {
            body_col = body_col.push(
                button(text("Turn off Sound").size(12))
                    .on_press(Message::StopAudio)
                    .width(Length::Fill)
                    .style(secondary_button()),
            );
        }

        sections.push(
            container(body_col)
                .padding([10, 14])
                .width(Length::Fill)
                .into(),
        );
        sections.push(divider());
    }

    // Footer
    let footer_label = if let Some((alarm, secs)) = next {
        let for_device = device_id
            .as_ref()
            .map(|id| alarm.devices.iter().any(|d| d == id))
            .unwrap_or(true);
        if for_device {
            format!("Time left: {}", format_countdown(secs))
        } else {
            "No alarms for this device".to_string()
        }
    } else {
        "No alarms for this device".to_string()
    };

    sections.push(
        container(
            column![
                text(footer_label).size(12).color(COLORS.text_secondary),
                button(text("Add an Alarm").size(13))
                    .on_press(Message::ToggleAddAlarm)
                    .width(Length::Fill)
                    .style(secondary_button()),
            ]
            .spacing(6),
        )
        .padding([10, 14])
        .width(Length::Fill)
        .into(),
    );

    // ── Assemble bubble ───────────────────────────────────────────────────────

    let tail: Element<Message> = Canvas::new(BubbleTail {
        fill: COLORS.bg,
        stroke: COLORS.border,
        tip_up: nav_top,
    })
    .width(Length::Fixed(POP_WIDTH))
    .height(Length::Fixed(TAIL_H))
    .into();

    let card: Element<Message> = container(column(sections))
        .width(Length::Fixed(POP_WIDTH))
        .style(|_theme| iced::widget::container::Style {
            background: Some(iced::Background::Color(COLORS.bg)),
            border: Border {
                color: COLORS.border,
                width: 1.0,
                radius: 10.0.into(),
            },
            shadow: Shadow {
                color: Color::from_rgba(0.0, 0.0, 0.0, 0.18),
                offset: Vector::new(0.0, 4.0),
                blur_radius: 14.0,
            },
            text_color: None,
            snap: false,
        })
        .into();

    // Top navbar: tail at top (pointing up toward navbar), card below.
    // Bottom navbar: card first, tail at bottom (pointing down toward navbar).
    if nav_top {
        column![tail, card].spacing(0).into()
    } else {
        column![card, tail].spacing(0).into()
    }
}
