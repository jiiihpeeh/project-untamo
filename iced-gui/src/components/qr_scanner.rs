use crate::messages::Message;
use crate::theme::{
    card_container_style, error_container_style, primary_button, secondary_button,
    text_input_style, COLORS,
};
use iced::{
    widget::{button, column, container, image, row, text, text_input},
    Element, Length,
};

pub fn qr_scanner<'a>(
    error: Option<&'a String>,
    scanning: bool,
    token_input: &'a str,
    frame_count: u32,
    frame_data: Option<&'a (u32, u32, Vec<u8>)>,
    refresh_toggle: bool,
) -> Element<'a, Message> {
    let title = text("QR Scanner").size(20).color(COLORS.text);

    let error_display: Element<'a, Message> = if let Some(err) = error {
        container(
            row![
                text("⚠").size(14).color(COLORS.danger),
                text(err).size(14).color(COLORS.text),
            ]
            .spacing(6),
        )
        .padding([8, 12])
        .style(error_container_style())
        .into()
    } else {
        text("").size(12).into()
    };

    let version_text = if refresh_toggle { "t1" } else { "t0" };
    let _ = &version_text;

    let scanner_content = if scanning {
        let preview: Element<'a, Message> = if let Some((width, height, pixels)) = frame_data {
            let expected_len = *width as usize * *height as usize * 4;
            if pixels.len() == expected_len {
                let handle = image::Handle::from_rgba(*width, *height, pixels.clone());
                container(
                    image::Image::new(handle)
                        .width(Length::Fixed(*width as f32))
                        .height(Length::Fixed(*height as f32)),
                )
                .width(Length::Fixed(300.0))
                .height(Length::Fixed(225.0))
                .center_x(Length::Fill)
                .center_y(Length::Fill)
                .into()
            } else {
                container(
                    text(format!("Invalid: {} != {}", pixels.len(), expected_len))
                        .size(12)
                        .color(COLORS.danger),
                )
                .width(Length::Fixed(640.0))
                .height(Length::Fixed(480.0))
                .center_x(Length::Fill)
                .center_y(Length::Fill)
                .into()
            }
        } else {
            container(
                text("Waiting for camera...")
                    .size(14)
                    .color(COLORS.text_secondary),
            )
            .width(Length::Fixed(640.0))
            .height(Length::Fixed(480.0))
            .center_x(Length::Fill)
            .center_y(Length::Fill)
            .into()
        };

        column![
            title,
            container(preview)
                .width(Length::Fixed(640.0))
                .height(Length::Fixed(480.0))
                .style(card_container_style()),
            text(format!("Frame: {} {}", frame_count, version_text))
                .size(10)
                .color(COLORS.text_secondary),
            text("Point your QR code at the camera")
                .size(12)
                .color(COLORS.text),
            text("or click Cancel to exit")
                .size(12)
                .color(COLORS.text_secondary),
            error_display,
            text("").size(8),
            button(text("Cancel Scanner"))
                .on_press(Message::CloseQrScanner)
                .style(secondary_button()),
        ]
        .spacing(10)
        .padding(20)
    } else {
        let manual_entry = column![
            title,
            text("Enter QR token manually:").size(14).color(COLORS.text),
            text("").size(8),
            text_input("Enter QR token", token_input)
                .on_input(Message::QrTokenInputChanged)
                .padding(10)
                .width(Length::Fixed(280.0))
                .style(text_input_style()),
            text("").size(12),
            error_display,
            text("").size(8),
            button(text("Submit Token"))
                .on_press(Message::QrSubmit(token_input.to_string()))
                .width(Length::Fixed(280.0))
                .style(primary_button()),
            text("").size(8),
            button(text("Open Camera Scanner"))
                .on_press(Message::StartScanner)
                .width(Length::Fixed(280.0))
                .style(secondary_button()),
            text("").size(8),
            button(text("Cancel"))
                .on_press(Message::CloseQrScanner)
                .width(Length::Fixed(280.0))
                .style(secondary_button()),
        ]
        .spacing(4)
        .padding(20);

        manual_entry
    };

    container(scanner_content)
        .style(card_container_style())
        .max_width(350)
        .into()
}
