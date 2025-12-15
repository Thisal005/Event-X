package com.oop.EventTicketingSystem.service;

import com.microsoft.playwright.*;
import com.microsoft.playwright.options.LoadState;
import com.microsoft.playwright.options.ScreenshotType;
import org.springframework.stereotype.Service;

/**
 * Service to convert HTML content to image using Microsoft Playwright.
 * Uses headless Chromium browser to render HTML and capture screenshot.
 */
@Service
public class HtmlToImageService {

    /**
     * Converts HTML content to a PNG image.
     * 
     * @param htmlContent The HTML content to render
     * @return byte[] containing the PNG image data
     */
    public byte[] convertHtmlToImage(String htmlContent) {
        try (Playwright playwright = Playwright.create()) {
            BrowserType.LaunchOptions launchOptions = new BrowserType.LaunchOptions()
                    .setHeadless(true);
            
            Browser browser = playwright.chromium().launch(launchOptions);
            
            BrowserContext context = browser.newContext(new Browser.NewContextOptions()
                    .setViewportSize(800, 600));
            
            Page page = context.newPage();
            
            // Set the HTML content
            page.setContent(htmlContent);
            
            // Wait for the page to fully render
            page.waitForLoadState(LoadState.NETWORKIDLE);
            
            // Take a full-page screenshot
            Page.ScreenshotOptions screenshotOptions = new Page.ScreenshotOptions()
                    .setFullPage(true)
                    .setType(ScreenshotType.PNG);
            
            byte[] screenshot = page.screenshot(screenshotOptions);
            
            // Cleanup
            context.close();
            browser.close();
            
            return screenshot;
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert HTML to image", e);
        }
    }

    /**
     * Converts HTML content to a PNG image with custom viewport dimensions.
     * 
     * @param htmlContent The HTML content to render
     * @param width The viewport width in pixels
     * @param height The viewport height in pixels
     * @return byte[] containing the PNG image data
     */
    public byte[] convertHtmlToImage(String htmlContent, int width, int height) {
        try (Playwright playwright = Playwright.create()) {
            BrowserType.LaunchOptions launchOptions = new BrowserType.LaunchOptions()
                    .setHeadless(true);
            
            Browser browser = playwright.chromium().launch(launchOptions);
            
            BrowserContext context = browser.newContext(new Browser.NewContextOptions()
                    .setViewportSize(width, height));
            
            Page page = context.newPage();
            
            // Set the HTML content
            page.setContent(htmlContent);
            
            // Wait for the page to fully render
            page.waitForLoadState(LoadState.NETWORKIDLE);
            
            // Take a full-page screenshot
            Page.ScreenshotOptions screenshotOptions = new Page.ScreenshotOptions()
                    .setFullPage(true)
                    .setType(ScreenshotType.PNG);
            
            byte[] screenshot = page.screenshot(screenshotOptions);
            
            // Cleanup
            context.close();
            browser.close();
            
            return screenshot;
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert HTML to image", e);
        }
    }
}

